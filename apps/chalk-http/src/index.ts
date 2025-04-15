import express from "express";
import { prismaClient } from "@repo/db/client";
import { redisClient } from "@repo/redis/redis";

import cors from "cors";
import jwt from "jsonwebtoken";
import {
  CreateUserSchema,
  SigninUserSchema,
  CreateRoomSchema,
  JWT_SECRET,
} from "@repo/common/config";
import { auth } from "./middleware";
import { error } from "console";

declare global {
  namespace Express {
    interface Request {
      userId?: string; //or other type you would like to use
    }
  }
}

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hi you are connected");
});

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (parsedData.success) {
    try {
      const user = await prismaClient.user.create({
        data: {
          email: parsedData.data.email,
          name: parsedData.data.name,
          password: parsedData.data.password,
        },
      });
      res.status(201).json({
        user,
      });
      return;
    } catch (e: any) {
      if (e.code === "P2002") {
        res.status(409).json({
          error: "User already exists",
        });
        return;
      } else {
        throw e;
      }
    }
  } else {
    res.status(400).json({
      error: parsedData.error.issues[0]?.message || "Internal server error",
    });
  }
});

app.post("/login", async (req, res) => {
  const parsedData = SigninUserSchema.safeParse(req.body);

  if (parsedData.success) {
    const user = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data.email,
        password: parsedData.data.password,
      },
    });
    if (user) {
      await prismaClient.user.update({
        where: { id: user.id },
        data: { online: true },
      });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.status(200).json({
        token,
      });
    } else {
      res.status(401).json({
        error: "wrong email or password",
      });
    }
  } else {
    res.status(401).json({
      error: parsedData.error,
    });
  }
});

app.use(auth);

app.post("/logout", async (req, res) => {
  try {
    if (!req.userId) {
      console.log("userId is not present"); // or throw an error
      return;
    } else {
      await prismaClient.user.update({
        where: { id: req.userId },
        data: { online: false },
      });
      res.status(200).json({
        message: "logged out",
      });
    }
  } catch (e) {
    res.status(401).json({
      error: e,
    });
  }
});

app.get("/user", async (req, res) => {
  try {
    if (!req.userId) {
      console.log("userId is not present");
      return;
    }
    const user = await prismaClient.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    res.status(200).json({
      user,
    });
  } catch (e) {
    res.status(401).json({
      error: e,
    });
  }
});

app.post("/room", async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!req.userId) {
    console.log("userId is not present");
    return;
  }
  if (!parsedData.success) {
    res.status(401).json({
      message: parsedData.error,
    });
    return;
  }
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: req.body.slug,
        description: req.body.description || null,

        adminId: req.userId,
      },
    });

    await prismaClient.roomUser.create({
      data: {
        userId: req.userId,
        roomId: room.id,
      },
    });

    res.status(200).json({
      room,
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: e,
    });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    if (!req.userId) {
      console.log("userId is not present");
      return;
    }
    const rooms = await prismaClient.room.findMany({
      where: {
        joinedUsers: {
          some: {
            userId: req.userId,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        description: true,
        _count: {
          select: { joinedUsers: true }, // Counts the number of users
        },
      },
    });

    console.log(rooms);

    res.status(200).json({
      rooms,
    });
  } catch (e) {
    res.status(403).json({
      message: e,
    });
  }
});

app.get("/slugToRoom/:slug", async (req, res) => {
  try {
    const room = await prismaClient.room.findFirst({
      where: {
        slug: req.params.slug,
      },
    });
    res.status(200).json({
      room,
    });
  } catch (e) {
    res.status(401).json({
      message: e,
    });
  }
});

app.get("/chat/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const chatKey = `chat:${roomId}:messages`;

    const cachedMessages = await redisClient.lRange(chatKey, 0, -1);

    if (cachedMessages.length > 0) {
      const parsedMessages = cachedMessages.map((msg) => JSON.parse(msg));

      if (parsedMessages.length > 0) {
        res.status(200).json({
          source: "redis",
          messages: parsedMessages,
        });
        return;
      }
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId },
    });

    if (messages.length > 0) {
      for (const msg of messages) {
        await redisClient.rPush(chatKey, JSON.stringify(msg));
      }
      await redisClient.expire(chatKey, 3600);
    }
    res.status(200).json({
      source: "postgres",
      messages,
    });
  } catch (e) {
    console.error("Error fetching messages:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/joinRoom/:roomId", async (req, res) => {
  try {
    if (!req.userId) {
      console.log("userId is not present");
      return;
    }
    const existingEntry = await prismaClient.roomUser.findFirst({
      where: {
        roomId: Number(req.params.roomId),

        userId: req.userId,
      },
    });

    if (existingEntry) {
      res.status(402).json({
        message: "User has already joined the room",
      });
      return;
    }
    await prismaClient.roomUser.create({
      data: {
        roomId: Number(req.params.roomId),
        userId: req.userId,
      },
    });

    res.status(200).json({
      message: "succesfully joined",
    });
  } catch (e) {
    res.status(401).json({
      message: e,
    });
  }
});

app.get("/roomUsers/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);

    const users = await prismaClient.roomUser.findMany({
      where: { roomId },
      select: { user: { select: { name: true, online: true, id: true } } },
    });

    const userInfo = users.map(
      (roomUser: { user: { name: any; online: any; id: any } }) => ({
        name: roomUser.user.name,
        online: roomUser.user.online,
        id: roomUser.user.id,
      })
    );

    res.json({ users: userInfo });
  } catch (error) {
    console.error("Error fetching room users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/leaveRoom/:roomId", async (req, res) => {
  try {
    if (!req.userId) {
      console.log("userId is not present");
      return;
    }
    const userId = req.userId;
    const roomId = Number(req.params.roomId);

    await prismaClient.roomUser.delete({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    const room = await prismaClient.room.findFirst({
      where: {
        id: roomId,
      },
    });
    if (room && room.adminId === userId) {
      const newAdmin = await prismaClient.roomUser.findFirst({
        where: {
          roomId: roomId,
        },
        select: { userId: true },
      });

      if (newAdmin) {
        await prismaClient.room.update({
          where: { id: roomId },
          data: { adminId: newAdmin.userId },
        });
      } else {
        await prismaClient.room.delete({
          where: {
            id: roomId,
          },
        });
      }
    }

    res.status(200).json({
      message: "leave successful",
    });
  } catch (e) {
    res.status(401).json({
      message: e,
    });
  }
});

app.listen(8080);
