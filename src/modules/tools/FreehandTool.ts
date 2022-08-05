import getStroke, { StrokeOptions } from "perfect-freehand";
import { colorToNumber as ctn } from "../../utils/utils";

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
  thinning: 0.8,
  smoothing: 0.01,
  streamline: 1,
  easing: (t) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: false,
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
    this.path.interactive = true;
    // color = getRandomIntInclusive(0, 0xffffff);

    this.pixi.items.addChild(this.path);
    const { x, y } = this.pixi.viewport.toWorld(event.data.global);

    this.points.push([x, y]);
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;

    const { color } = this._freeOptions;
    const s1 = getStroke(this.points, this._strokeOptions);
    const t = event.data.global;

    const { x, y } = this.pixi.viewport.toWorld(event.data.global);
    this.points.push([x, y]);

    this.path.clear();
    this.path.beginFill(ctn(color), 1);
    this.path.lineStyle({ width: 1, color: 0xffffff });
    // const s = getStroke(points, options);
    // const c = getStrokePoints(points, options);
    // const s = getStrokeOutlinePoints(c, options);
    const s2 = getStroke(this.points, this._strokeOptions);

    // const poly = polygonClipping.difference([s2 as Ring]);
    // const p = poly[0];
    // const s = [...p[0]];
    const s = s2;
    const fs = s.flatMap((i) => i);
    this.path.drawPolygon(fs);

    // path.drawShape(new Polygon(fs));
    // path.finishPoly();
    // path.closePath();
    this.path.endFill();
  };

  drawEnd = () => {
    console.log("freehand:pointerup");

    // if (this._mode === TOOL.FREEHAND) {
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
    // path.interactive = true;
    this.dragging = false;
    this.points = [];

    this.pixi.disablePanning();
    // }
  };
}
