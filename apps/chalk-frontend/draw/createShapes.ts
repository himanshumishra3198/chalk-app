import { PaletteOptionProps } from "../app/configs/paletteOptions";
import { RoughCanvas } from "roughjs/bin/canvas";

enum sloppiness {
  low = 0,
  medium = 1,
  high = 2,
}

const defaultConfiguration = {
  seed: 2,
};

export const createRectangle = ({
  x,
  y,
  width,
  height,
  rc,
  paletteConfigurations,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  console.log(paletteConfigurations);
  rc.rectangle(x, y, width, height, {
    stroke: paletteConfigurations.strokeColor,
    fill: paletteConfigurations.backgroundColor,

    fillStyle: paletteConfigurations.fillStyle,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      (paletteConfigurations.strokeStyle as string) === "dashed"
        ? [6, 4]
        : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });
};

export const createCircle = ({
  x,
  y,
  radius,
  rc,
  paletteConfigurations,
}: {
  x: number;
  y: number;
  radius: number;
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  rc.circle(x, y, radius, {
    stroke: paletteConfigurations.strokeColor,
    fill: paletteConfigurations.backgroundColor,
    fillStyle: paletteConfigurations.fillStyle,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      (paletteConfigurations.strokeStyle as string) === "dashed"
        ? [6, 4]
        : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],

    ...defaultConfiguration,
  });
};

export const createDiamond = ({
  startX,
  startY,
  x,
  y,
  rc,
  paletteConfigurations,
}: {
  startX: number;
  startY: number;
  x: number;
  y: number;
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  const centerX = (startX + x) / 2;
  const centerY = (startY + y) / 2;
  const halfWidth = Math.abs(x - startX) / 2;
  const halfHeight = Math.abs(y - startY) / 2;

  // Points of the diamond: top, right, bottom, left
  const points: [number, number][] = [
    [centerX, centerY - halfHeight], // top
    [centerX + halfWidth, centerY], // right
    [centerX, centerY + halfHeight], // bottom
    [centerX - halfWidth, centerY], // left
  ];

  rc.polygon(points, {
    stroke: paletteConfigurations.strokeColor,
    fill: paletteConfigurations.backgroundColor,
    fillStyle: paletteConfigurations.fillStyle,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      paletteConfigurations.strokeStyle === "dashed" ? [6, 4] : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });
};

export const createLine = ({
  startX,
  startY,
  x,
  y,
  rc,
  paletteConfigurations,
}: {
  startX: number;
  startY: number;
  x: number;
  y: number;
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  rc.line(startX, startY, x, y, {
    stroke: paletteConfigurations.strokeColor,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      paletteConfigurations.strokeStyle === "dashed" ? [6, 4] : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });
};

export const createArrow = ({
  startX,
  startY,
  x,
  y,
  rc,
  paletteConfigurations,
}: {
  startX: number;
  startY: number;
  x: number;
  y: number;
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  // Main line
  rc.line(startX, startY, x, y, {
    stroke: paletteConfigurations.strokeColor,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      paletteConfigurations.strokeStyle === "dashed" ? [6, 4] : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });

  // Arrowhead
  const angle = Math.atan2(y - startY, x - startX);
  const headLength = 12;

  const arrowPoint1: [number, number] = [
    x - headLength * Math.cos(angle - Math.PI / 7),
    y - headLength * Math.sin(angle - Math.PI / 7),
  ];
  const arrowPoint2: [number, number] = [
    x - headLength * Math.cos(angle + Math.PI / 7),
    y - headLength * Math.sin(angle + Math.PI / 7),
  ];

  rc.line(x, y, arrowPoint1[0], arrowPoint1[1], {
    stroke: paletteConfigurations.strokeColor,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });

  rc.line(x, y, arrowPoint2[0], arrowPoint2[1], {
    stroke: paletteConfigurations.strokeColor,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });
};

export const createPencil = ({
  points,
  rc,
  paletteConfigurations,
}: {
  points: { x: number; y: number }[];
  rc: RoughCanvas;
  paletteConfigurations: PaletteOptionProps;
}) => {
  if (points.length < 2) return;

  const curvePoints: [number, number][] = points.map((point) => [
    point.x,
    point.y,
  ]);

  rc.curve(curvePoints, {
    stroke: paletteConfigurations.strokeColor,
    strokeWidth: Number(paletteConfigurations.strokeWidth),
    strokeLineDash:
      paletteConfigurations.strokeStyle === "dashed" ? [6, 4] : undefined,
    roughness:
      sloppiness[paletteConfigurations.sloppiness as keyof typeof sloppiness],
    ...defaultConfiguration,
  });
};
