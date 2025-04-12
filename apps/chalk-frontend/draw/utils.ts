import axios from "axios";

import { Shape } from "./shapes";
import { BACKEND_URL } from "../app/configs";
import {
  createRectangle,
  createCircle,
  createArrow,
  createDiamond,
  createLine,
  createPencil,
} from "./createShapes";
import { RoughCanvas } from "roughjs/bin/canvas";

export function clearCanvas(
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  existingShapes: Shape[],
  rc: RoughCanvas
) {
  if (ctx) {
    console.log("clearing canvas");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    existingShapes.map((shape) => {
      if (shape.type === "Rectangle") {
        createRectangle({
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Circle") {
        createCircle({
          x: shape.x,
          y: shape.y,
          radius: shape.radius,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Diamond") {
        createDiamond({
          x: shape.x,
          y: shape.y,
          startX: shape.startX,
          startY: shape.startY,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Line") {
        createLine({
          startX: shape.startX,
          startY: shape.startY,
          x: shape.x,
          y: shape.y,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Arrow") {
        createArrow({
          startX: shape.startX,
          startY: shape.startY,
          x: shape.x,
          y: shape.y,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Pencil") {
        createPencil({
          points: shape.points,
          rc,
          paletteConfigurations: shape.paletteConfigurations,
        });
      } else if (shape.type === "Text") {
        createText(ctx, shape.text, shape.x, shape.y);
      }
    });
  }
}

export function createText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  // Set default options
  const font = "16px Arial",
    color = "white",
    textAlign = "left",
    textBaseline = "top";

  // Apply styles
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  // Draw the text
  ctx.fillText(text, x, y);
}

export async function getExistingShapes(roomId: number) {
  const token = localStorage.getItem("token");
  const res = await axios.get(BACKEND_URL + `/chat/${roomId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (res.status == 200) {
    const messages = res.data.messages;
    console.log(messages);
    let shapes = messages.map((x: { message: string }) => {
      console.log(x.message);
      const message = JSON.parse(x.message);
      return message;
    });
    const parsedShapes = shapes.map((shape: any) => {
      return {
        ...shape,
        paletteConfigurations: JSON.parse(shape.paletteConfigurations),
      };
    });
    console.log("parsedshape:", parsedShapes);
    return parsedShapes;
  } else {
    console.log(res.data);
    return [];
  }
}

export function getShapeDistanceToPoint(
  point: { x: number; y: number },
  shape: Shape
): number {
  switch (shape.type) {
    case "Rectangle": {
      const x1 = Math.min(shape.x, shape.x + shape.width);
      const x2 = Math.max(shape.x, shape.x + shape.width);
      const y1 = Math.min(shape.y, shape.y + shape.height);
      const y2 = Math.max(shape.y, shape.y + shape.height);

      const dx = Math.max(x1 - point.x, 0, point.x - x2);
      const dy = Math.max(y1 - point.y, 0, point.y - y2);
      return Math.sqrt(dx * dx + dy * dy); // 0 if inside
    }

    case "Circle": {
      const dist = Math.hypot(point.x - shape.x, point.y - shape.y);
      return Math.max(0, dist - shape.radius);
    }

    case "Diamond": {
      const centerX = (shape.x + shape.startX) / 2;
      const centerY = (shape.y + shape.startY) / 2;
      const halfW = Math.abs(shape.x - shape.startX) / 2;
      const halfH = Math.abs(shape.y - shape.startY) / 2;
      const dx = Math.abs(point.x - centerX);
      const dy = Math.abs(point.y - centerY);
      const inside = dx / halfW + dy / halfH <= 1;
      if (inside) return 0;
      return Math.hypot(dx - halfW, dy - halfH);
    }

    case "Line":
    case "Arrow": {
      const a = { x: shape.startX, y: shape.startY };
      const b = { x: shape.x, y: shape.y };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len === 0) return Math.hypot(point.x - a.x, point.y - a.y);
      const t =
        ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) /
        (len * len);
      const clampedT = Math.max(0, Math.min(1, t));
      const proj = {
        x: a.x + clampedT * (b.x - a.x),
        y: a.y + clampedT * (b.y - a.y),
      };
      return Math.hypot(point.x - proj.x, point.y - proj.y);
    }

    case "Pencil": {
      let minDist = Infinity;
      for (let i = 0; i < shape.points.length - 1; i++) {
        const a = shape.points[i];
        const b = shape.points[i + 1];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        if (len === 0) continue;
        const t =
          ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) /
          (len * len);
        const clampedT = Math.max(0, Math.min(1, t));
        const proj = {
          x: a.x + clampedT * (b.x - a.x),
          y: a.y + clampedT * (b.y - a.y),
        };
        const dist = Math.hypot(point.x - proj.x, point.y - proj.y);
        minDist = Math.min(minDist, dist);
      }
      return minDist;
    }

    case "Text": {
      const textWidth = 100;
      const textHeight = 20;
      const inside =
        point.x >= shape.x &&
        point.x <= shape.x + textWidth &&
        point.y >= shape.y - textHeight &&
        point.y <= shape.y;
      if (inside) return 0;
      const dx = Math.max(
        shape.x - point.x,
        0,
        point.x - (shape.x + textWidth)
      );
      const dy = Math.max(shape.y - textHeight - point.y, 0, point.y - shape.y);
      return Math.sqrt(dx * dx + dy * dy);
    }

    default:
      return Infinity;
  }
}

function getShapeSize(shape: Shape): number {
  switch (shape.type) {
    case "Rectangle":
      return shape.width * shape.height;
    case "Circle":
      return Math.PI * shape.radius * shape.radius;
    case "Diamond":
      return (
        Math.abs(shape.x - shape.startX) * Math.abs(shape.y - shape.startY)
      );
    case "Line":
    case "Arrow":
      return Math.hypot(shape.x - shape.startX, shape.y - shape.startY);
    case "Pencil":
      return shape.points.length;
    case "Text":
      return 100 * 20; // fixed dimensions assumed in your isPointInside
    default:
      return Infinity;
  }
}
export function getClosestShapeIndex(
  point: { x: number; y: number },
  shapes: Shape[]
): number {
  let closestIndex = -1;
  let minDistance = Infinity;
  let minSize = Infinity;
  const threshold = 10;

  shapes.forEach((shape, index) => {
    const distance = getShapeDistanceToPoint(point, shape);

    if (distance < threshold) {
      const size = getShapeSize(shape);

      if (
        distance < minDistance ||
        (distance === minDistance && size < minSize)
      ) {
        minDistance = distance;
        minSize = size;
        closestIndex = index;
      }
    }
  });

  return closestIndex;
}

export function updateShapePosition(
  selectedShape: Shape,
  newX: number,
  newY: number
): Shape {
  if (
    selectedShape.type === "Rectangle" ||
    selectedShape.type === "Circle" ||
    selectedShape.type === "Text"
  ) {
    selectedShape.x = newX;
    selectedShape.y = newY;
  } else if (
    selectedShape.type === "Diamond" ||
    selectedShape.type === "Line" ||
    selectedShape.type === "Arrow"
  ) {
    const width = selectedShape.x - selectedShape.startX;
    const height = selectedShape.y - selectedShape.startY;

    selectedShape.startX = newX;
    selectedShape.startY = newY;
    selectedShape.x = newX + width;
    selectedShape.y = newY + height;
  } else if (selectedShape.type === "Pencil") {
    const firstPoint = selectedShape.points[0];
    if (!firstPoint) {
      return selectedShape;
    }
    const dx = newX - firstPoint.x;
    const dy = newY - firstPoint.y;

    for (let point of selectedShape.points) {
      point.x += dx;
      point.y += dy;
    }
  }

  return selectedShape;
}

export function getShapeOffset(
  shape: Shape,
  mouseX: number,
  mouseY: number
): {
  offsetX: number;
  offsetY: number;
} {
  switch (shape.type) {
    case "Rectangle":
    case "Circle":
    case "Text":
      return {
        offsetX: mouseX - shape.x,
        offsetY: mouseY - shape.y,
      };

    case "Diamond":
    case "Line":
    case "Arrow":
      // We'll take the top-left corner (startX/startY) as the reference
      return {
        offsetX: mouseX - shape.startX,
        offsetY: mouseY - shape.startY,
      };

    case "Pencil":
      // For pencil, use the first point as reference
      if (shape.points.length > 0) {
        return {
          offsetX:
            shape.points && shape.points[0] ? mouseX - shape.points[0].x : 0,
          offsetY:
            shape.points && shape.points[0] ? mouseY - shape.points[0].y : 0,
        };
      } else {
        return { offsetX: 0, offsetY: 0 };
      }

    default:
      return { offsetX: 0, offsetY: 0 };
  }
}
