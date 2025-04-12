import { isEqual, update } from "lodash";
import { Shape } from "./shapes";

import rough from "roughjs/bundled/rough.esm.js";

import {
  getShapeOffset,
  getClosestShapeIndex,
  updateShapePosition,
  clearCanvas,
} from "./utils";
import {
  createRectangle,
  createCircle,
  createArrow,
  createDiamond,
  createLine,
  createPencil,
} from "./createShapes";
import { PaletteOptionProps } from "../app/configs/paletteOptions";

interface PlayProps {
  myCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  ws: WebSocket | null;
  room: any;
  selectedTool: string;
  signal: AbortSignal;
  loadedShapes: Shape[];
  paletteOption: PaletteOptionProps;
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
let oldShape: string | undefined = undefined;

export async function InitDraw({
  myCanvas,
  ctx,
  ws,
  room,
  selectedTool,
  signal,
  loadedShapes,
  paletteOption,
}: PlayProps) {
  if (!ctx || !ws || !room) return;
  const rc = rough.canvas(myCanvas);
  console.log(selectedTool);
  existingShapes = loadedShapes;

  clearCanvas(ctx, myCanvas, existingShapes, rc);

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
      } else if (checkErase.type === "MOVE_SHAPE") {
        const oldShape = JSON.parse(checkErase.oldShape);
        const newShape = JSON.parse(checkErase.newShape);

        let index = -1;
        for (let i = 0; i < existingShapes.length; i++) {
          if (isEqual(existingShapes[i], oldShape)) {
            index = i;
            break;
          }
        }
        if (index !== -1) {
          existingShapes[index] = newShape;
        }
      } else {
        const shape = JSON.parse(message.message);
        const parsedShape = {
          ...shape,
          paletteConfigurations: JSON.parse(shape.paletteConfigurations),
        };
        existingShapes.push(parsedShape);
      }

      clearCanvas(ctx, myCanvas, existingShapes, rc);
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
          oldShape = JSON.stringify(selectedShape);
          offesetX = offsets.offsetX;
          offesetY = offsets.offsetY;
        }
      }
    }
  };
  let message = "";
  const mouseUpHandler = (e: MouseEvent) => {
    clicked = false;
    clearCanvas(ctx, myCanvas, existingShapes, rc);
    let { x, y } = getMousePosition(myCanvas, e);
    if (selectedTool === "Select") {
      if (selectedShape && oldShape) {
        const newShape = JSON.stringify(selectedShape);
        ws.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({
              type: "DROP_SHAPE",
              oldShape,
              newShape,
            }),
            roomId: room.id,
          })
        );
      }
      selectedShapeIndex = -1;
      offesetX = 0;
      offesetY = 0;
      selectedShape = undefined;
    } else if (selectedTool === "Rectangle") {
      existingShapes.push({
        type: "Rectangle",
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });

      message = JSON.stringify({
        type: "Rectangle",
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
        paletteConfigurations: JSON.stringify(paletteOption),
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
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });
      message = JSON.stringify({
        type: "Circle",
        x: startX,
        y: startY,
        radius: radius,
        paletteConfigurations: JSON.stringify(paletteOption),
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
              paletteConfigurations: {
                strokeColor: paletteOption.strokeColor,
                backgroundColor: "transparent",
                fillStyle: "solid",
                strokeWidth: "thin",
                strokeStyle: "solid",
                sloppiness: "low",
              },
            });
            message = JSON.stringify({
              type: "Text",
              x: x,
              y: y,
              text: input.value,
              paletteConfigurations: JSON.stringify(paletteOption),
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
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });

      message = JSON.stringify({
        type: "Diamond",
        startX,
        startY,
        x,
        y,
        paletteConfigurations: JSON.stringify(paletteOption),
      });
    } else if (selectedTool === "Line") {
      existingShapes.push({
        type: "Line",
        startX,
        startY,
        x,
        y,
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });

      message = JSON.stringify({
        type: "Line",
        startX,
        startY,
        x,
        y,
        paletteConfigurations: JSON.stringify(paletteOption),
      });
    } else if (selectedTool === "Arrow") {
      existingShapes.push({
        type: "Arrow",
        startX,
        startY,
        x,
        y,
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });

      message = JSON.stringify({
        type: "Arrow",
        startX,
        startY,
        x,
        y,
        paletteConfigurations: JSON.stringify(paletteOption),
      });
    } else if (selectedTool === "Pencil") {
      existingShapes.push({
        type: "Pencil",
        points,
        paletteConfigurations: {
          strokeColor: paletteOption.strokeColor,
          backgroundColor: paletteOption.backgroundColor,
          fillStyle: paletteOption.fillStyle,
          strokeWidth: paletteOption.strokeWidth,
          strokeStyle: paletteOption.strokeStyle,
          sloppiness: paletteOption.sloppiness,
        },
      });

      message = JSON.stringify({
        type: "Pencil",
        points,
        paletteConfigurations: JSON.stringify(paletteOption),
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
    if (selectedTool !== "Select")
      clearCanvas(ctx, myCanvas, existingShapes, rc);
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    if (clicked && ctx) {
      clearCanvas(ctx, myCanvas, existingShapes, rc);
      ctx.strokeStyle = "white";
      let { x, y } = getMousePosition(myCanvas, e);

      if (selectedTool === "Eraser") {
        const shapeIndex = getClosestShapeIndex({ x, y }, existingShapes);
        if (shapeIndex !== -1) {
          let erasedShape = existingShapes[shapeIndex];
          if (erasedShape) {
            let stringifiedShape = {
              ...erasedShape,
              paletteConfigurations: JSON.stringify(
                erasedShape.paletteConfigurations
              ),
            };
            existingShapes.splice(shapeIndex, 1);
            const message = JSON.stringify({
              type: "Eraser",
              index: shapeIndex,
              shape: JSON.stringify(stringifiedShape),
            });

            ws.send(
              JSON.stringify({
                type: "chat",
                message: message,
                roomId: room.id,
              })
            );
            clearCanvas(ctx, myCanvas, existingShapes, rc);
          }
        }
      } else if (selectedTool === "Select") {
        if (selectedShapeIndex !== -1) {
          if (selectedShape) {
            const newX = x - offesetX;
            const newY = y - offesetY;
            const oldShape = JSON.stringify(selectedShape);
            updateShapePosition(selectedShape, newX, newY);
            const newShape = JSON.stringify(selectedShape);
            ws.send(
              JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                  type: "MOVE_SHAPE",
                  oldShape,
                  newShape,
                }),
                roomId: room.id,
              })
            );
            clearCanvas(ctx, myCanvas, existingShapes, rc);
          }
        }
      } else if (selectedTool === "Rectangle") {
        createRectangle({
          x: startX,
          y: startY,
          width: x - startX,
          height: y - startY,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
      } else if (selectedTool === "Circle") {
        const radius = Math.sqrt(
          (x - startX) * (x - startX) + (y - startY) * (y - startY)
        );
        createCircle({
          x: startX,
          y: startY,
          radius: radius,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
      } else if (selectedTool === "Diamond") {
        createDiamond({
          startX,
          startY,
          x,
          y,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
      } else if (selectedTool === "Line") {
        createLine({
          startX,
          startY,
          x,
          y,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
      } else if (selectedTool === "Arrow") {
        createArrow({
          startX,
          startY,
          x,
          y,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
      } else if (selectedTool === "Pencil") {
        points.push({ x, y });

        createPencil({
          points,
          rc,
          paletteConfigurations: {
            strokeColor: paletteOption.strokeColor,
            backgroundColor: paletteOption.backgroundColor,
            fillStyle: paletteOption.fillStyle,
            strokeWidth: paletteOption.strokeWidth,
            strokeStyle: paletteOption.strokeStyle,
            sloppiness: paletteOption.sloppiness,
          },
        });
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
