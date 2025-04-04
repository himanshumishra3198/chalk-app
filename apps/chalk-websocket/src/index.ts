import { JWT_SECRET } from "@repo/common/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { prismaClient } from "@repo/db/client";

import { addChatToQueue, removeChatFromQueue } from "./utils";

const wss = new WebSocketServer({ port: 8081 });

// const users = [
//   {userId: 1
//     ws: WebSocket,
//     rooms: array of room ids
//   }
// ]

// message = {
//   type: "join_room",
//   roomId: int
// }
// {
//   type: "chat",
//   message: "message"
//   roomId: 123
// }

interface UsersSchema {
  userId: string;
  ws: WebSocket;
  rooms: string[];
}

const users: UsersSchema[] = [];
const onlineUsers: string[] = [];

function verifyUser(token: string) {
  try {
    if (typeof token !== "string") {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string" || !decoded.userId) {
      return null;
    }
    const userId = decoded.userId;
    return userId;
  } catch (e) {
    return null;
  }
}

function notAlreadySubscribed(rooms: string[], roomId: string) {
  const present = rooms.find((id) => roomId === id);
  if (present) return false;
  else return true;
}

wss.on("connection", (ws, req) => {
  const queryParams = new URLSearchParams(req.url?.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = verifyUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  onlineUsers.push(userId);

  const existingUser = users.find((user) => user.userId === userId);
  if (!existingUser) {
    users.push({ userId, rooms: [], ws });
  } else {
    existingUser.ws = ws; // Update WebSocket connection
  }

  ws.on("close", () => {
    // Remove disconnected users
    const index = users.findIndex((user) => user.ws === ws);
    if (index !== -1) users.splice(index, 1);
    const onlineIndex = onlineUsers.findIndex((id) => id === userId);
    if (onlineIndex !== -1) onlineUsers.splice(onlineIndex, 1); // Remove user from onlineUsers
  });

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data as unknown as string);
    const user = users.find((user) => user.ws === ws);
    if (!user) return;
    if (parsedData.type === "online_users") {
      ws.send(
        JSON.stringify({
          type: "online_users",
          users: onlineUsers,
        })
      );
    } else if (parsedData.type === "join_room") {
      if (user && notAlreadySubscribed(user.rooms, parsedData.roomId))
        user.rooms.push(parsedData.roomId);
    } else if (parsedData.type === "leave_room") {
      user.rooms = user.rooms.filter(
        (roomId) => roomId !== String(parsedData.roomId)
      );
    } else if (parsedData.type === "chat") {
      let message = parsedData.message;

      users.map((eachUser) => {
        if (eachUser.rooms.includes(parsedData.roomId) && eachUser.ws !== ws) {
          eachUser.ws.send(
            JSON.stringify({
              type: "chat",
              message: parsedData.message,
              roomId: parsedData.roomId,
            })
          );
        }
      });
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === "Eraser") {
        removeChatFromQueue({
          roomId: parsedData.roomId,
          message: parsedMessage.shape,
          userId: user.userId,
        });
      } else {
        await addChatToQueue({
          roomId: parsedData.roomId,
          message: parsedData.message,
          userId: user.userId,
        });
      }
    }
  });
});
