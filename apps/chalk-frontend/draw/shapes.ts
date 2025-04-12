// export interface PaletteOptionProps {
//   strokeColor: string;
//   backgroundColor: string;
//   fillStyle: string;
//   strokeWidth: string;
//   strokeStyle: string;
//   sloppiness: string;
// }

import { PaletteOptionProps } from "../app/configs/paletteOptions";

export type Shape =
  | {
      type: "Rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Circle";
      x: number;
      y: number;
      radius: number;
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Diamond";
      x: number;
      y: number;
      startX: number;
      startY: number;
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Line";
      startX: number;
      startY: number;
      x: number;
      y: number;
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Arrow";
      startX: number;
      startY: number;
      x: number;
      y: number;
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Pencil";
      points: { x: number; y: number }[];
      paletteConfigurations: PaletteOptionProps;
    }
  | {
      type: "Text";
      text: string;
      x: number;
      y: number;
      paletteConfigurations: PaletteOptionProps;
    };
