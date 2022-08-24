import {
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";
import { usePaperStore } from "../../store/PaperStore";
import { BaseItem, BaseProps } from "../items/BaseItem";

export type EraserToolOptions = {
  color: number | string;
};

export class EraserTool extends BaseTool {
  private dragging: boolean;

  private deleteQueue: BaseItem[];

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.deleteQueue = [];
  }

  activate(baseEvents = true, options?: InteractionManagerOptions | undefined) {
    super.activate(baseEvents, options);
    if (!this.interaction) return;

    // attach listeners:
    this.interaction.on("pointerdown", this.startErase);
    this.interaction.on("pointerup", this.endErase);
    this.interaction.on("pointerupoutside", this.endErase);

    const throttledMoveErase = throttle(this.moveErase, 5);
    this.interaction.on("pointermove", throttledMoveErase);
  }

  private addToEraseQueue = (event: InteractionEvent) => {
    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    const hit = im.hitTest(event.data.global, this.pixi.items);

    if (hit) {
      hit.alpha = 0.2;
      hit.interactive = false;
      this.deleteQueue.push(hit as BaseItem);
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

    const statelist: BaseProps[] = [];

    this.deleteQueue.forEach((item) => {
      if (!item.destroyed) {
        statelist.push(item.getProps());
        item.destroy();
      }
    });

    usePaperStore.getState().removeItem(...statelist);
    // ^^^^ Sync all the removes with the store in one state change
    // rather than syncing each remove one by one by calling item.syncWithStore()
    // we DO NOT call syncWithStore() on each item so that we can delete all of them
    // in the same state change. This will be useful for undo and redo.
  };
}
