import getStroke, { StrokeOptions } from "perfect-freehand";
import { colorToNumber as ctn, getRandomIntInclusive } from "../../utils/utils";
import polygonClipping, { Ring } from "polygon-clipping";
import {
  Graphics,
  InteractionEvent,
  InteractionManagerOptions,
} from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";

export type FreehandToolOptions = {
  color: number | string;
};

const DEFAULT_STROKE_OPTIONS: StrokeOptions = {
  size: 10,
  smoothing: 0.5,
  thinning: 0.7,
  streamline: 0.99,
  easing: (t) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

export class FreehandTool extends BaseTool {
  private path: Graphics;
  private dragging: boolean;
  private points: number[][];
  private _strokeOptions: StrokeOptions;
  private _freeOptions: FreehandToolOptions;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);
    this.cursor = "crosshair";

    this._strokeOptions = DEFAULT_STROKE_OPTIONS;
    this._freeOptions = { color: 0 };
    this.path = new Graphics();
    this.dragging = false;
    this.points = [];
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:

    // attach listeners:
    if (blank) return;
    this.interaction?.on("pointerdown", this.drawStart);
    this.interaction?.on("pointerup", this.drawEnd);
    this.interaction?.on("pointermove", this.drawMove);
  }

  drawStart = (event: InteractionEvent) => {
    if (this.button === 1) return;
    console.log("freehand:pointerdown");
    this.dragging = true;
    this.path = new Graphics();
    // this.path.interactive = true;
    // color = getRandomIntInclusive(0, 0xffffff);

    this.pixi.items.addChild(this.path);
    const { x, y } = this.pixi.viewport.toWorld(event.data.global);

    this.points.push([x, y]);
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    const { color } = this._freeOptions;
    // const s1 = getStroke(this.points, this._strokeOptions);
    // const t = event.data.global;

    const { x, y } = this.pixi.viewport.toWorld(event.data.global);
    this.points.push([x, y]);
    this.path.clear();

    const outlinePoints = getStroke(this.points, this._strokeOptions);
    const faces = polygonClipping.xor([outlinePoints as Ring]);

    this.path.clear();
    this.path.beginFill(ctn(color), 1);
    faces.forEach((face, i) => {
      face.forEach((points, j) => {
        // this.path.lineStyle({ width: 1, color: 0xffffff });
        if (j !== 0) this.path.beginHole();
        this.path.drawPolygon(points.flatMap((p) => p));
        this.path.finishPoly();
        if (j !== 0) this.path.endHole();
      });
    });
    this.path.endFill();
  };

  drawEnd = () => {
    console.log("freehand:pointerup");

    // console.log(path.)
    // path.destroy();
    // const finalPath = new Graphics();
    // const s = getStroke(points, {
    //   ...options,
    //   end: {
    //     taper: true,
    //     cap: false,
    //   },
    // });
    // const fs = s.flatMap((i) => i);
    // finalPath.beginFill(color, 1);
    // finalPath.drawPolygon(fs);
    // finalPath.endFill();
    // items.current?.addChild(finalPath);
    this.path.interactive = true;
    this.dragging = false;
    this.points = [];

    // this.pixi.enablePanning();

    // this.pixi.disablePanning();
  };
}
