import { JWT_SECRET } from "@repo/common/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";

import { addChatToQueue, removeChatFromQueue } from "./utils";
import { prismaClient } from "@repo/db/client";

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
      await prismaClient.user.update({
        where: { id: user.userId },
        data: { online: parsedData.online },
      });
    } else if (parsedData.type === "join_room") {
      if (user && notAlreadySubscribed(user.rooms, parsedData.roomId))
        user.rooms.push(parsedData.roomId);
    } else if (parsedData.type === "leave_room") {
      user.rooms = user.rooms.filter(
        (roomId) => roomId !== String(parsedData.roomId)
      );
    } else if (parsedData.type === "chat") {
      const { message, roomId } = parsedData;
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type !== "DROP_SHAPE") {
        users.forEach((eachUser) => {
          if (eachUser.rooms.includes(roomId) && eachUser.ws !== ws) {
            eachUser.ws.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
              })
            );
          }
        });
      }

      (async () => {
        try {
          if (parsedMessage.type === "Eraser") {
            await removeChatFromQueue({
              roomId,
              message: parsedMessage.shape,
              userId: user.userId,
            });
          } else if (parsedMessage.type === "DROP_SHAPE") {
            await removeChatFromQueue({
              roomId,
              message: parsedMessage.oldShape,
              userId: user.userId,
            });
            await addChatToQueue({
              roomId,
              message: parsedMessage.newShape,
              userId: user.userId,
            });
          } else if (
            parsedMessage.type !== "MOVE_SHAPE" &&
            parsedMessage.type !== "Eraser" &&
            parsedMessage.type !== "DROP_SHAPE" &&
            parsedMessage.type !== "Select"
          ) {
            await addChatToQueue({
              roomId,
              message,
              userId: user.userId,
            });
          }
        } catch (error) {
          console.error("Redis update failed:", error);
        }
      })();
    }
  });
});
