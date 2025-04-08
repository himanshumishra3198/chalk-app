import { isEqual, update } from "lodash";
import { Shape } from "./shapes";
import {
  getShapeOffset,
  getClosestShapeIndex,
  updateShapePosition,
} from "./utils";
import {
  clearCanvas,
  createArrow,
  createCircle,
  createLine,
  createPencil,
  drawDiamond,
} from "./utils";

interface PlayProps {
  myCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  ws: WebSocket | null;
  room: any;
  selectedTool: string;
  signal: AbortSignal;
  loadedShapes: Shape[];
}

function getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent) {
  let rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

let existingShapes: Shape[] = [];
let selectedShapeIndex = -1;
let offesetX = 0,
  offesetY = 0;
let selectedShape: Shape | undefined = undefined;
// const existingSh apes: Shape[] = [];

export async function InitDraw({
  myCanvas,
  ctx,
  ws,
  room,
  selectedTool,
  signal,
  loadedShapes,
}: PlayProps) {
  if (!ctx || !ws || !room) return;
  console.log(selectedTool);
  existingShapes = loadedShapes;

  clearCanvas(ctx, myCanvas, existingShapes);

  const handleMessage = (e: any) => {
    const message = JSON.parse(e.data);
    if (message.type === "chat") {
      const checkErase = JSON.parse(message.message);
      console.log(checkErase);
      if (checkErase.type === "Eraser") {
        const currShape = JSON.parse(checkErase.shape);

        let index = -1;
        for (let i = 0; i < existingShapes.length; i++) {
          if (isEqual(existingShapes[i], currShape)) {
            console.log(existingShapes[i], currShape);
            index = i;
            break;
          }
        }
        if (index !== -1) {
          existingShapes.splice(index, 1);
        }
      } else {
        existingShapes.push(JSON.parse(message.message));
      }

      clearCanvas(ctx, myCanvas, existingShapes);
    }
  };
  ws.addEventListener("message", handleMessage, { signal });
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
    if (selectedTool === "Select") {
      selectedShapeIndex = getClosestShapeIndex({ x, y }, existingShapes);
      if (selectedShapeIndex !== -1) {
        selectedShape = existingShapes[selectedShapeIndex];
        if (selectedShape) {
          let offsets = getShapeOffset(selectedShape, x, y);
          offesetX = offsets.offsetX;
          offesetY = offsets.offsetY;
        }
      }
    }
  };
  let message = "";
  const mouseUpHandler = (e: MouseEvent) => {
    clicked = false;
    clearCanvas(ctx, myCanvas, existingShapes);
    let { x, y } = getMousePosition(myCanvas, e);
    if (selectedTool === "Select") {
      selectedShapeIndex = -1;
      offesetX = 0;
      offesetY = 0;
      selectedShape = undefined;
    } else if (selectedTool === "Rectangle") {
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
        const shapeIndex = getClosestShapeIndex({ x, y }, existingShapes);
        if (shapeIndex !== -1) {
          const erasedShape = existingShapes[shapeIndex];
          existingShapes.splice(shapeIndex, 1);
          const message = JSON.stringify({
            type: "Eraser",
            index: shapeIndex,
            shape: JSON.stringify(erasedShape),
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
      } else if (selectedTool === "Select") {
        if (selectedShapeIndex !== -1) {
          if (selectedShape) {
            const newX = x - offesetX;
            const newY = y - offesetY;
            updateShapePosition(selectedShape, newX, newY);
            // existingShapes[selectedShapeIndex] = selectedShape;
            clearCanvas(ctx, myCanvas, existingShapes);
          }
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
        points.push({ x, y });
        createPencil({ ctx, points, color: "white" });
      }
    }
  };

  myCanvas.addEventListener("mousedown", mouseDownHandler, { signal });
  myCanvas.addEventListener("mouseup", mouseUpHandler, { signal });
  myCanvas.addEventListener("mousemove", mouseMoveHandler, { signal });
  return () => {
    ws.removeEventListener("message", handleMessage);
  };
}
