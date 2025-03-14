export type Shape =
  | {
      type: "Rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "Circle";
      x: number;
      y: number;
      radius: number;
    }
  | {
      type: "Diamond";
      x: number;
      y: number;
      startX: number;
      startY: number;
    }
  | {
      type: "Line";
      startX: number;
      startY: number;
      x: number;
      y: number;
    }
  | {
      type: "Arrow";
      startX: number;
      startY: number;
      x: number;
      y: number;
    }
  | {
      type: "Pencil";
      points: { x: number; y: number }[];
    }
  | {
      type: "Text";
      text: string;
      x: number;
      y: number;
    };
