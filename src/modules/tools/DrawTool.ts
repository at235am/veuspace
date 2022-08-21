import { colorToNumber as ctn, round10 } from "../../utils/utils";

import { InteractionEvent, InteractionManagerOptions } from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";
import { BrushPath, BrushStyle } from "../items/Brush";

export type FreehandToolOptions = {
  color: number | string;
};

export class DrawTool extends BaseTool {
  private dragging: boolean;
  private path: BrushPath;
  private options: BrushStyle;
  private checkpointIndex: number;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.checkpointIndex = 0;
    this.dragging = false;
    this.options = { color: 0x222222, size: 5 };
    this.path = new BrushPath();
    this.path.destroy();
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);
    if (blank) return;
    if (!this.interaction) return;

    // handle viewport listeners:

    // attach listeners:
    this.interaction.on("pointerdown", this.drawStart);
    this.interaction.on("pointerup", this.drawEnd);
    this.interaction.on("pointerupoutside", this.drawEnd);
    // this.interaction.on("pointermove", this.drawMove);
    const throttleMove = throttle(this.drawMove, 20, { leading: true });
    this.interaction.on("pointermove", throttleMove);
  }

  setOptions = (options: Partial<BrushStyle>) => {
    this.options = { ...this.options, ...options };
  };

  /**
   * Incase there is a need to separate out the when we record each point on pointermove
   * and then rendering it.
   */
  storePointsRaw = (event: InteractionEvent) => {
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([x, y]);
  };

  storePointsNormalized = (event: InteractionEvent) => {
    const { x: dx, y: dy } = this.path.position;
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([round10(x - dx), round10(y - dy)]);
  };

  storePointsWithEpsilon = (event: InteractionEvent) => {
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    const e = 5; // epsilon or threshold

    const g_i = this.checkpointIndex; // last "good" point's index
    const p_i = this.path.points.length - 1; // previous index (p.i.)

    const g = this.path.points[g_i]; // last "good" point
    const c = [x, y]; // current point

    const dx = Math.abs(c[0] - g[0]);
    const dy = Math.abs(c[1] - g[1]);
    const d = Math.sqrt(dx * dx + dy * dy);

    // remove previous point if its not the good point:
    if (p_i !== g_i) this.path.points.pop();
    // add the current point:
    this.path.points.push(c);
    // update the "good" point to the current point if its far enough away:
    if (d > e) this.checkpointIndex = this.path.points.length - 1;
  };

  drawStart = (event: InteractionEvent) => {
    // this handles if the users press down with multiple touches:
    if (this.touches > 1 && !this.path.destroyed) this.path?.destroy();

    // if its not the left click or if multitouching
    if (this.button !== 0 || this.touches > 1) return;

    // state of tool:
    this.dragging = true;
    const { color, size } = this.options;

    // object:
    this.path = this.pixi.items.addChild(
      new BrushPath({ fillColor: color, size })
    );

    // this.path.parentGroup = this.pixi.itemGroup;

    // console.log(this.path.parent);

    // get and add first points:
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.position.set(round10(x), round10(y));
    this.path.points.push([0, 0]);

    this.path.draw();

    // this.checkpointIndex = 0;
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    this.storePointsNormalized(event);
    this.path.draw();
  };

  drawEnd = () => {
    // reset the states of the tool:
    this.dragging = false;

    if (this.path.destroyed) return;

    this.path.syncWithStore();

    // we set interactive to true here instead of earlier for a little bit of performance:
    this.path.generateHitArea();
    this.path.interactive = true;

    // debug stuff:
    // this.path.drawPoints();
    // this.path.drawHitArea();
  };
}
