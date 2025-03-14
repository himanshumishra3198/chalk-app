import { useEffect, useRef, useState } from "react";
import { WEBSOCKET_URL } from "../../configs";
import { MainCanvas } from "./mainCanvas";

export function SocketConnection({ room }: { room: any }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);
    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: room.id,
        })
      );
    };

    return () => {
      ws.close();
    };
  }, []);
  if (!socket) {
    return <div>Connecting to server</div>;
  }
  return <div>{socket && <MainCanvas room={room} ws={socket} />}</div>;
}
