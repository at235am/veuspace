import {
  InteractionData,
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";
import { BaseItem } from "../items/BaseItem";
import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";

export class SelectTool extends BaseTool {
  private dragging: boolean;
  private mousedowndata: InteractionData | null;
  private offset: { x: number; y: number };
  private item: BaseItem | null;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.mousedowndata = null;
    this.offset = { x: 0, y: 0 };
    this.item = null;
  }

  activate(options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    this.interaction?.on("pointerdown", this.moveStart);
    this.interaction?.on("pointerup", this.moveEnd);
    this.interaction?.on("pointerupoutside", this.moveEnd);
    this.interaction?.on("pointermove", this.moveMove);
  }

  moveStart = (event: InteractionEvent) => {
    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    this.item = im.hitTest(event.data.global, this.pixi.items) as BaseItem;

    if (this.button === 1) return;
    if (!this.item) return;

    this.pixi.disablePanning();
    this.dragging = true;
    this.item.alpha = 0.8;
    this.mousedowndata = event.data;
    const lp = event.data.getLocalPosition(this.item.parent);
    this.offset = { x: this.item.x - lp.x, y: this.item.y - lp.y };
  };

  moveEnd = (event: InteractionEvent) => {
    if (this.item) {
      this.item.alpha = 1;
      this.item.syncWithStore();
    }
    this.dragging = false;
    this.mousedowndata = null;
    this.item = null;
  };

  moveMove = (event: InteractionEvent) => {
    if (!(this.dragging && this.item && this.mousedowndata)) return;
    const new_pos = this.mousedowndata.getLocalPosition(this.item.parent);
    this.item.position.set(
      new_pos.x + this.offset.x,
      new_pos.y + this.offset.y
    );
  };
}
