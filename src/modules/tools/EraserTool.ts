import { colorToNumber as ctn } from "../../utils/utils";

import {
  DisplayObject,
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";

export type EraserToolOptions = {
  color: number | string;
};

export class EraserTool extends BaseTool {
  private dragging: boolean;

  private deleteQueue: DisplayObject[];

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.deleteQueue = [];
  }

  public activate(
    blank = false,
    options?: InteractionManagerOptions | undefined
  ) {
    super.start(false, options);
    if (blank) return;
    if (!this.interaction) return;

    // attach listeners:
    this.interaction.on("pointerdown", this.startErase);
    this.interaction.on("pointerup", this.endErase);
    this.interaction.on("pointerupoutside", this.endErase);

    const throttledMoveErase = throttle(this.moveErase, 10);
    this.interaction.on("pointermove", throttledMoveErase);
  }

  private addToEraseQueue = (event: InteractionEvent) => {
    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    const hit = im.hitTest(event.data.global, this.pixi.items);

    if (hit) {
      hit.alpha = 0.2;
      this.deleteQueue.push(hit);
    }
  };

  private startErase = (event: InteractionEvent) => {
    // if its not the left click or if multitouching
    if (this.button !== 0 || this.touches > 1) return;

    // state of tool:
    this.dragging = true;

    this.addToEraseQueue(event);
  };

  private moveErase = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;

    this.addToEraseQueue(event);
  };

  private endErase = () => {
    // reset the states of the tool:
    this.dragging = false;

    this.deleteQueue.forEach((item) => {
      if (!item.destroyed) item.destroy();
    });
  };
}
