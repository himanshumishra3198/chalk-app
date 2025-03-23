import express from "express";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
import jwt from "jsonwebtoken";
import {
  CreateUserSchema,
  SigninUserSchema,
  CreateRoomSchema,
  JWT_SECRET,
} from "@repo/common/config";
import { auth } from "./middleware";

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
      error: parsedData.error,
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
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: Number(req.params.roomId),
      },
    });
    res.status(200).json({
      messages,
    });
  } catch (e) {
    res.status(400).json({
      message: e,
    });
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
      select: { user: { select: { name: true } } },
    });

    const userNames = users.map((roomUser) => roomUser.user.name);

    res.json({ users: userNames });
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

    // check if the user was owner of the room if yes then reassign to another user
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
