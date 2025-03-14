import { useEffect, useRef, useState } from "react";

import Toolbar from "./toolBar";

import { InitDraw } from "../../../draw";
import { UserAvatar } from "@repo/ui/userAvatar";
import { useRoomUsers } from "../../../hooks/useRoomUsers";

export function MainCanvas({ room, ws }: { room: any; ws: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedTool, setSelectedTool] = useState<string>("Select");

  let { users, loading, error } = useRoomUsers(room.id);
  let userAvatars;
  if (!loading) {
    console.log(users);
    userAvatars = users.map((user: string, index) => {
      return (
        <div key={index}>
          <UserAvatar name={user.split(" ")[0]} />
        </div>
      );
    });
  }

  useEffect(() => {
    const updateCanvasSize = () => {
      const parent = canvasRef.current?.parentElement;
      if (parent) {
        setCanvasSize({
          width: parent.clientWidth,
          height: parent.clientHeight,
        });
      }
    };

    updateCanvasSize(); // Set initial size
    window.addEventListener("resize", updateCanvasSize); // Update on resize

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const myCanvas = canvasRef.current;
      const ctx = myCanvas.getContext("2d");
      if (!ctx || !room || !ws) return;
      // Clear existing event listeners to avoid multiple listeners
      const abortController = new AbortController();
      const { signal } = abortController;
      // Re-initialize drawing logic with the new selectedTool
      InitDraw({ myCanvas, ctx, ws, room, selectedTool, signal });
      return () => {
        abortController.abort();
      };
    }
  }, [canvasSize, selectedTool, room, ws]); // Re-run when canvasSize or selectedTool changes

  return (
    <div className="h-screen w-screen bg-black grid grid-cols-8 grid-rows-1">
      <div className="flex flex-col gap-4 col-span-1 border-white/10 border-r-2 p-4">
        {userAvatars}
      </div>
      <div
        className={`col-span-7 ${selectedTool === "Select" ? "" : "cursor-crosshair"}`}
      >
        <Toolbar
          selectedTool={selectedTool}
          changeTool={(tool) => {
            setSelectedTool(() => {
              return tool;
            });
          }}
        />
        <canvas
          ref={canvasRef}
          className="bg-black block"
          width={canvasSize.width}
          height={canvasSize.height}
        ></canvas>
      </div>
    </div>
  );
}
