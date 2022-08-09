import { colorToNumber as ctn } from "../../utils/utils";

import { InteractionEvent, InteractionManagerOptions } from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";
import { BrushPath, BrushOptions } from "../items/Brush";

export type FreehandToolOptions = {
  color: number | string;
};

export class FreehandTool extends BaseTool {
  private dragging: boolean;
  private path: BrushPath;
  private options: BrushOptions;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);
    this.cursor = "crosshair";

    this.dragging = false;
    this.options = { color: 0x222222, size: 5 };
    this.path = new BrushPath();
    this.path.destroy();
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:

    // attach listeners:
    if (blank) return;

    this.interaction?.on("pointerdown", this.drawStart);
    this.interaction?.on("pointerup", this.drawEnd);
    this.interaction?.on("pointerupoutside", this.drawEnd);

    // this.interaction?.on("pointermove", this.storePoints);

    const throttleMove = throttle(this.drawMove, 20);
    this.interaction?.on("pointermove", throttleMove);
    // const debounceMove = debounce(this.drawMove, 0);
    // this.interaction?.on("pointermove", debounceMove);
    // this.interaction?.on("pointermove", this.drawMove);
  }

  setOptions = (options: Partial<BrushOptions>) => {
    this.options = { ...this.options, ...options };
  };

  /**
   * Incase there is a need to separate out the when we record each point on pointermove
   * and then rendering it.
   */
  storePoints = (event: InteractionEvent) => {
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    this.path.points.push([x, y]);
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
    this.path = new BrushPath([], { color, size });
    this.pixi.items.addChild(this.path);

    // get and add first points:
    this.storePoints(event);
    this.path.draw();
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;

    this.storePoints(event);
    this.path.draw();
  };

  drawEnd = () => {
    // reset the states of the tool:
    this.dragging = false;
    // this.path = null;

    // algorithm to reduce points by eliminating once that are too close to each other:
    //  const [px, py] = this.path.points[this.path.points.length - 1];
    //  const dx = x - px;
    //  const dy = y - py;
    //  if (Math.sqrt(dx * dx + dy * dy) < 25) return;

    // we set interactive to true here instead of earlier for a little bit of performance:
    this.path.interactive = true;
    this.path.computeHitArea();
  };
}
