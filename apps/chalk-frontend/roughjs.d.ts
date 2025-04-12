declare module "roughjs/bundled/rough.esm.js" {
  import { RoughCanvas } from "roughjs/bin/canvas";
  const rough: {
    canvas: (canvas: HTMLCanvasElement) => RoughCanvas;
  };
  export default rough;
}
