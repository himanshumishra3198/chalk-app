import { ReactNode } from "react";
import { Shape } from "./shapes";
import { isPointInside } from "./utils";
import {
  clearCanvas,
  createArrow,
  createCircle,
  createLine,
  createPencil,
  drawDiamond,
  getExistingShapes,
  createText,
} from "./utils";
import { Circle } from "lucide-react";
interface PlayProps {
  myCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  ws: WebSocket | null;
  room: any;
  selectedTool: string;
  signal: AbortSignal;
}

function getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent) {
  let rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

let existingShapes: Shape[] = [];

// const existingSh apes: Shape[] = [];

export async function InitDraw({
  myCanvas,
  ctx,
  ws,
  room,
  selectedTool,
  signal,
}: PlayProps) {
  if (!ctx || !ws || !room) return;
  console.log(selectedTool);
  existingShapes = await getExistingShapes(room.id);
  clearCanvas(ctx, myCanvas, existingShapes);

  ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    if (message.type === "chat") {
      const checkErase = JSON.parse(message.message);
      if (checkErase.type === "Eraser") {
        existingShapes.splice(checkErase.index, 1);
      } else {
        existingShapes.push(JSON.parse(message.message));
      }

      clearCanvas(ctx, myCanvas, existingShapes);
    }
  };

  let clicked = false;
  let startX = 0,
    startY = 0;
  let points: { x: number; y: number }[] = [];

  const mouseDownHandler = (e: MouseEvent) => {
    clicked = true;
    let { x, y } = getMousePosition(myCanvas, e);

    startX = x;
    startY = y;
    points = [{ x, y }];
  };
  let message = "";
  const mouseUpHandler = (e: MouseEvent) => {
    clicked = false;
    clearCanvas(ctx, myCanvas, existingShapes);
    let { x, y } = getMousePosition(myCanvas, e);

    if (selectedTool === "Rectangle") {
      existingShapes.push({
        type: "Rectangle",
        x: startX,
        y: startY,
        height: x - startX,
        width: y - startY,
      });

      message = JSON.stringify({
        type: "Rectangle",
        x: startX,
        y: startY,
        height: x - startX,
        width: y - startY,
      });
    } else if (selectedTool === "Circle") {
      const radius = Math.sqrt(
        (x - startX) * (x - startX) + (y - startY) * (y - startY)
      );
      existingShapes.push({
        type: "Circle",
        x: startX,
        y: startY,
        radius: radius,
      });
      message = JSON.stringify({
        type: "Circle",
        x: startX,
        y: startY,
        radius: radius,
      });
    } else if (selectedTool === "Text") {
      const input = document.createElement("input");
      input.type = "text";
      input.style.position = "absolute";
      input.style.left = `${e.clientX}px`;
      input.style.top = `${e.clientY}px`;
      input.style.background = "transparent";
      input.style.color = "white";
      input.style.font = "16px Arial";
      input.style.border = "none";
      input.style.outline = "none";
      document.body.appendChild(input);
      input.focus();

      input.addEventListener(
        "blur",
        (e) => {
          console.log(e);
          if (input.value.trim()) {
            console.log(input.value);
            existingShapes.push({
              type: "Text",
              x: x,
              y: y,
              text: input.value,
            });
            message = JSON.stringify({
              type: "Text",
              x: x,
              y: y,
              text: input.value,
            });
          }
          document.body.removeChild(input);
        },
        { once: true }
      );
    } else if (selectedTool === "Diamond") {
      existingShapes.push({
        type: "Diamond",
        startX: startX,
        startY: startY,
        x: x,
        y: y,
      });

      message = JSON.stringify({
        type: "Diamond",
        startX,
        startY,
        x,
        y,
      });
    } else if (selectedTool === "Line") {
      existingShapes.push({
        type: "Line",
        startX,
        startY,
        x,
        y,
      });

      message = JSON.stringify({
        type: "Line",
        startX,
        startY,
        x,
        y,
      });
    } else if (selectedTool === "Arrow") {
      existingShapes.push({
        type: "Arrow",
        startX,
        startY,
        x,
        y,
      });

      message = JSON.stringify({
        type: "Arrow",
        startX,
        startY,
        x,
        y,
      });
    } else if (selectedTool === "Pencil") {
      existingShapes.push({
        type: "Pencil",
        points,
      });

      message = JSON.stringify({
        type: "Pencil",
        points,
      });

      points = [];
    }
    if (selectedTool !== "Select" && selectedTool !== "Eraser") {
      if (message.length) {
        ws.send(
          JSON.stringify({
            type: "chat",
            message: message,
            roomId: room.id,
          })
        );
      }
    }
    if (selectedTool !== "Select") clearCanvas(ctx, myCanvas, existingShapes);
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    if (clicked && ctx) {
      clearCanvas(ctx, myCanvas, existingShapes);
      ctx.strokeStyle = "white";
      let { x, y } = getMousePosition(myCanvas, e);

      if (selectedTool === "Eraser") {
        const shapeIndex = existingShapes.findIndex((shape) => {
          return isPointInside({ x, y }, shape);
        });
        if (shapeIndex !== -1) {
          existingShapes.splice(shapeIndex, 1);
          const message = JSON.stringify({
            type: "Eraser",
            index: shapeIndex,
            shape: JSON.stringify(existingShapes[shapeIndex]),
          });

          ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId: room.id,
            })
          );
          clearCanvas(ctx, myCanvas, existingShapes);
        }
      } else if (selectedTool === "Rectangle") {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (selectedTool === "Circle") {
        const radius = Math.sqrt(
          (x - startX) * (x - startX) + (y - startY) * (y - startY)
        );
        createCircle({
          x: startX,
          y: startY,
          radius: radius,
          color: "white",
          ctx,
        });
      } else if (selectedTool === "Diamond") {
        drawDiamond(ctx, startX, startY, x, y);
      } else if (selectedTool === "Line") {
        createLine({ startX, startY, x, y, color: "white", ctx });
      } else if (selectedTool === "Arrow") {
        createArrow({ ctx, startX, startY, x, y });
      } else if (selectedTool === "Pencil") {
        let { x, y } = getMousePosition(myCanvas, e);
        points.push({ x, y });
        createPencil({ ctx, points, color: "white" });
      }
    }
  };

  myCanvas.addEventListener("mousedown", mouseDownHandler, { signal });
  myCanvas.addEventListener("mouseup", mouseUpHandler, { signal });
  myCanvas.addEventListener("mousemove", mouseMoveHandler, { signal });
}
