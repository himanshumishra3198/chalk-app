import { use, useEffect, useRef, useState } from "react";
import { PaletteOptionProps } from "../../../app/configs/paletteOptions";
import Toolbar from "./toolBar";

import { InitDraw } from "../../../draw";

import { useRoomUsers } from "../../../hooks/useRoomUsers";

import { useRouter } from "next/navigation";

import { Palette } from "./palette/palette";
import { ConnectedUsers } from "./connectedUsers";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainCanvas({
  room,
  ws,
  existingShapes,
}: {
  room: any;
  ws: any;
  existingShapes: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedTool, setSelectedTool] = useState<string>("Select");
  const [onlineUsers, setOnlineUsers] = useState<
    { id: string; name: string; online: boolean }[]
  >([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteOption, setPaletteOption] = useState<PaletteOptionProps>({
    strokeColor: "#EEEEEE",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: "1",
    strokeStyle: "solid",
    sloppiness: "low",
  });

  const router = useRouter();

  useEffect(() => {
    ws.send(JSON.stringify({ type: "online_users", online: true }));
    return () => {
      ws.send(JSON.stringify({ type: "online_users", online: false }));
    };
  }, []);

  let { users, loading, error } = useRoomUsers(room.id);
  useEffect(() => {
    if (!loading) {
      const userList = users.map(
        (user: { id: string; name: string; online: boolean }) => {
          return { id: user.id, name: user.name, online: user.online };
        }
      );
      setOnlineUsers(userList);
    }
  }, [loading]);

  function handleExit() {
    router.push("/dashboard");
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
    if (selectedTool === "Select" || selectedTool === "Eraser") {
      setPaletteOpen(false);
    } else {
      setPaletteOpen(true);
    }
    if (canvasRef.current) {
      const myCanvas = canvasRef.current;
      const ctx = myCanvas.getContext("2d");
      if (!ctx || !room || !ws) return;

      const abortController = new AbortController();
      const { signal } = abortController;

      InitDraw({
        myCanvas,
        ctx,
        ws,
        room,
        selectedTool,
        signal,
        loadedShapes: existingShapes,
        paletteOption,
      });
      return () => {
        abortController.abort();
      };
    }
  }, [canvasSize, selectedTool, room, ws, existingShapes, paletteOption]); // Re-run when canvasSize or selectedTool changes

  return (
    <div
      className={`h-screen w-screen bg-black ${selectedTool === "Select" ? "cursor-grab" : "cursor-crosshair"}`}
    >
      {/* <div className="flex flex-col justify-between col-span-1 border-white/10 border-r-2 p-4">
        <div className="flex flex-col gap-4 ">{userAvatars}</div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
            <Button
              variant="secondary"
              text="exit"
              onClick={handleExit}
              icon={<LogOut />}
            />
          </div>
        </div>
      </div> */}
      <div className="fixed top-0 right-0 z-50 p-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-zinc-800 rounded-full"
          onClick={handleExit}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Return</span>
        </Button>
      </div>
      <Palette
        paletteOpen={paletteOpen}
        setPaletteOption={setPaletteOption}
        paletteOption={paletteOption}
        selectedTool={selectedTool}
        setPaletteOpen={setPaletteOpen}
      />

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
      {!loading && <ConnectedUsers users={onlineUsers} />}
    </div>
  );
}
