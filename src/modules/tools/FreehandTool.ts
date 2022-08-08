import getStroke, { StrokeOptions } from "perfect-freehand";
import {
  colorToNumber as ctn,
  getRandomIntInclusive,
  getSvgPathFromStroke,
  midpoint,
} from "../../utils/utils";
import { MultiPolygon, Ring, union } from "polygon-clipping";
import {
  Graphics,
  InteractionEvent,
  InteractionManagerOptions,
  LINE_CAP,
  Polygon,
} from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";

export type FreehandToolOptions = {
  color: number | string;
};

const DEFAULT_STROKE_OPTIONS: StrokeOptions = {
  size: 4,
  smoothing: 0.5,
  thinning: 0,
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
  private path: BrushPath;
  private dragging: boolean;
  private _strokeOptions: StrokeOptions;
  private _freeOptions: FreehandToolOptions;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);
    this.cursor = "crosshair";

    this._strokeOptions = DEFAULT_STROKE_OPTIONS;
    this._freeOptions = { color: getRandomIntInclusive(0, 0xffffff) };
    this.path = new BrushPath();
    this.dragging = false;
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:

    // attach listeners:
    if (blank) return;

    this.interaction?.on("pointerdown", this.drawStart);
    this.interaction?.on("pointerup", this.drawEnd);
    // this.interaction?.on("pointermove", this.storePoints);

    // const throttleMove = throttle(this.drawMove, 20);
    // this.interaction?.on("pointermove", throttleMove);
    // const debounceMove = debounce(this.drawMove, 0);
    // this.interaction?.on("pointermove", debounceMove);
    this.interaction?.on("pointermove", this.drawMove);
  }

  normalPoint = (a: number[], b: number[], r: number) => {
    // midpoint between b and a:
    const px = (b[0] + a[0]) / 2;
    const py = (b[1] + a[1]) / 2;

    // slope components (rise / run) = (dy / dx):
    const dx = b[0] - a[0]; // run
    const dy = b[1] - a[1]; // rise

    // magnitude of slope vector:
    const V = Math.sqrt(dx * dx + dy * dy);

    // (dx / V) or (dy / V) represents a unit vector
    // and r represents the scalar for that unit vector
    const vx = (dy / V) * r; // notice x-comp is dy (see explanation below)
    const vy = -(dx / V) * r; // notice y-comp is -dx

    // Slope between two points b and a is m = dy / dx
    // However we want a point PERPENDICULAR aka NORMAL to that slope.
    // To get the slope normal to another slope is the negative reciprocal:
    // Let n be the normal slope:
    // n = -1 / m
    //   = -1 / (dy / dx)
    //   = -dx / dy
    // So for a vector v with components vx and vy where:
    // vy = rise = -dx (-dx is in the numerator; remember slope is rise OVER run)
    // vx = run = dy (dy is in the denominator so its run)

    // theres TWO normals to the midpoint of b and a (aka point p)
    return [
      [px + vx, py + vy],
      [px - vx, py - vy],
    ];
  };

  extraPoint = (a: number[], b: number[], r: number) => {
    // point to extend:
    const px = a[0];
    const py = a[1];

    // slope components (rise / run) = (dy / dx):
    const dx = b[0] - a[0]; // run
    const dy = b[1] - a[1]; // rise

    // magnitude of slope vector:
    const V = Math.sqrt(dx * dx + dy * dy);

    // (dx / V) or (dy / V) represents a unit vector
    // and r represents the scalar for that unit vector
    const vx = (dx / V) * r;
    const vy = (dy / V) * r;

    // theres TWO normals:
    return [
      [px + vx, py + vy],
      [px - vx, py - vy],
    ];
  };

  drawStart = (event: InteractionEvent) => {
    if (this.button !== 0 || this.touches > 1) return;

    // state of tool:
    this.dragging = true;
    this._freeOptions.color = getRandomIntInclusive(0, 0xffffff);
    const { color } = this._freeOptions;
    const { size = 10 } = this._strokeOptions;

    // object:
    this.path = new BrushPath();
    this.pixi.items.addChild(this.path);

    // get and add first points:
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([x, y]);

    // draw first point:
    this.path.beginFill(color, 1);
    this.path.drawCircle(Math.round(x), Math.round(y), size / 2);
    this.path.endFill();
  };

  /**
   * Incase there is a need to separate out the when we record each point on pointermove
   * and then rendering it.
   */
  storePoints = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([x, y]);
  };

  drawMove = (event: InteractionEvent) => {
    if (this.touches > 1) this.path.clear();
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    const { color } = this._freeOptions;
    const { size = 10 } = this._strokeOptions;
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([x, y]);
    const points = this.path.points;

    //----------------------------------------------------------------------------------
    // // FASTEST (USING BEZIER CURVES):
    let p1 = points[0];
    let p2 = points[1];

    this.path.clear();
    this.path.beginFill(0, 0);
    this.path.moveTo(p1[0], p1[1]);
    this.path.lineStyle({
      width: size,
      color: ctn(color),
      cap: LINE_CAP.ROUND,
    });

    for (let i = 1; i < points.length; i++) {
      const midPoint = midpoint(p1, p2); // endpoint
      this.path.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1]);
      p1 = points[i];
      p2 = points[i + 1];
    }
    this.path.lineTo(p1[0], p1[1]);
    this.path.endFill();

    //----------------------------------------------------------------------------------
    // // perfect-freehand implementation with the default fill rule on Graphics that's wrong:
    // this.path.clear();
    // this.path.beginFill(ctn(color), 1);
    // this.path.drawPolygon(outlinePoints.flatMap((p) => p));
    // this.path.endFill();
    //----------------------------------------------------------------------------------
    // // perfect-freehand using polygon-clipping to flatten the polygon
    // // before giving it to Graphics
    // const outlinePoints = getStroke(points, this._strokeOptions);
    // const outlineColor = outlinePoints.map((p, i) => [
    //   p[0],
    //   p[1],
    //   i * 0x010101,
    //   // ctn(getRandomIntInclusive(0, 0xffffff)),
    // ]);
    // const svgPath = getSvgPathFromStroke(outlinePoints);

    // try {
    //   const faces = union([outlinePoints as Ring]); // very expensive calculation, need to find a way to optimize this

    //   this.path.clear();
    //   // this.path.beginFill(ctn(color), 1);
    //   faces.forEach((face) => {
    //     face.forEach((points, j) => {
    //       // this.path.lineStyle({ width: 1, color: 0xffffff });
    //       if (j !== 0) this.path.beginHole();
    //       this.path.drawPolygon(points.flatMap((p) => p));
    //       this.path.finishPoly();
    //       if (j !== 0) this.path.endHole();
    //     });
    //   });
    //   // this.path.endFill();
    // } catch (e) {
    //   console.error(e);
    // }
    //--------------------------------------------------------------------------------
    // // SVG implementation (too slow)
    // if (!this.svg2 || !this.p2 || !this.svgScene) return;
    // this.svg2.firstChild?.remove();
    // this.p2.setAttributeNS("http://www.w3.org/2000/svg", "d", svgPath);
    // this.svg2.appendChild(this.p2);
    // this.svgScene.content = this.svg2;
    // this.svgScene.refresh();
    //----------------------------------------------------------------------------------
    // // FASTEST BUT VERY JAGGED:
    // const prev = points.at(-2);
    // const curr = points.at(-1);
    // if (!prev || !curr) return;
    // console.log(`(${prev[0]}, ${prev[1]}) (${curr[0]}, ${curr[1]})`);
    // // const rcolor = getRandomIntInclusive(0, 0xffffff);
    // this.path.beginFill();
    // this.path.lineStyle({ width: 3, color: ctn(color) });
    // this.path.moveTo(prev[0], prev[1]);
    // this.path.lineTo(curr[0], curr[1]);
    // this.path.endFill();
    //----------------------------------------------------------------------------------
  };

  drawEnd = () => {
    if (!this.dragging) return;

    // algorithm to reduce points by eliminating once that are too close to each other:
    //  const [px, py] = this.path.points[this.path.points.length - 1];
    //  const dx = x - px;
    //  const dy = y - py;
    //  if (Math.sqrt(dx * dx + dy * dy) < 25) return;

    const { size = 10 } = this._strokeOptions;
    const w = Math.max(3, size);
    const p = this.path.points;
    const top: number[][] = []; // points "above" or on "top" of the line of points
    const bot: number[][] = []; // points "below" or or "bottom" of the line of points
    for (let i = 0; i < p.length - 1; i++) {
      const [p1, p2] = this.normalPoint(p[i], p[i + 1], w);
      top.push(p1);
      bot.unshift(p2); // push in reverse so we dont have to reverse this list after
    }

    const [, first] = this.extraPoint(p[0], p[1], size);
    const [, last] = this.extraPoint(p[p.length - 1], p[p.length - 2], size);

    const polyorder = [first, ...top, last, ...bot];
    const polypoints = polyorder.flatMap((p) => p);

    this.path.hitArea = new Polygon(polypoints);
    this.path.interactive = true;
    // this.path.buttonMode = true;

    // reset the states of the tool:
    this.dragging = false;

    // // -----------------------------------------------------------------------------
    // // draw the top boundary:
    // const p_top = new Graphics();
    // this.pixi.items.addChild(p_top);
    // p_top.beginFill(0xff0000, 0);
    // p_top.moveTo(top[0][0], top[0][1]);
    // p_top.lineStyle({ color: 0xff0000, width: 1 });
    // top.forEach(([x, y]) => {
    //   // p_top.lineStyle({ color: getRandomIntInclusive(0, 0xffffff), width: 1 });
    //   p_top.lineTo(x, y);
    //   p_top.drawCircle(x, y, 2);
    // });
    // p_top.endFill();

    // // draw the entire boundary
    // const poly = new Graphics();
    // this.pixi.items.addChild(poly);
    // poly.beginFill(0xff0000, 0);
    // poly.moveTo(polyorder[0][0], polyorder[0][1]);
    // polyorder.forEach(([x, y]) => {
    //   poly.lineStyle({ color: getRandomIntInclusive(0, 0xffffff), width: 1 });
    //   poly.lineTo(x, y);
    //   poly.drawCircle(x, y, 2);
    // });
    // poly.lineTo(polyorder[0][0], polyorder[0][1]);
    // poly.endFill();

    // // draw the original line:
    // const originalLine = new Graphics();
    // this.pixi.items.addChild(originalLine);
    // originalLine.beginFill(0x00ffff, 1);
    // originalLine.moveTo(p[0][0], p[0][1]);
    // p.forEach(([x, y]) => {
    //   originalLine.lineStyle({ width: 1, color: 0x00ffff });
    //   originalLine.lineTo(x, y);
    //   originalLine.lineStyle({ width: 0 });
    //   originalLine.drawCircle(x, y, 2);
    // });
    // originalLine.endFill();
  };
}

export class BrushPath extends Graphics {
  points: number[][] = [];
}
