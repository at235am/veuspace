import {
  DisplayObject,
  InteractionData,
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
  Point,
} from "pixi.js-legacy";
import { PixiApplication, TOOL } from "../PixiApplication";
import { BaseTool } from "./BaseTool";

export class SelectTool extends BaseTool {
  private dragging: boolean;
  private mousedowndata: InteractionData | null;
  private offset: { x: number; y: number };
  private gfx: DisplayObject | null;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.mousedowndata = null;
    this.offset = { x: 0, y: 0 };
    this.gfx = null;
  }

  activate(options?: InteractionManagerOptions | undefined) {
    super.start(false, options);

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    // this.interaction?.on("pointerdown", this.onPointerDown);
    // this.interaction?.on("pointerup", this.onPointerUp);

    this.interaction?.on("pointerdown", this.moveStart);
    this.interaction?.on("pointerup", this.moveEnd);
    this.interaction?.on("pointerupoutside", this.moveEnd);
    this.interaction?.on("pointermove", this.moveMove);
  }

  moveStart = (event: InteractionEvent) => {
    console.log("select:pointerdown:onDragStart");
    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    this.gfx = im.hitTest(event.data.global, this.pixi.items);

    if (this.button === 1) return;
    if (!this.gfx) return;

    this.pixi.disablePanning();
    this.dragging = true;
    this.gfx.alpha = 0.8;
    this.mousedowndata = event.data;
    const lp = event.data.getLocalPosition(this.gfx.parent);
    this.offset = { x: this.gfx.x - lp.x, y: this.gfx.y - lp.y };
  };

  moveEnd = (event: InteractionEvent) => {
    // this.pixi.enablePanning();

    if (this.gfx) this.gfx.alpha = 1;
    this.dragging = false;
    this.mousedowndata = null;
    this.gfx = null;
  };

  moveMove = (event: InteractionEvent) => {
    if (!(this.dragging && this.gfx && this.mousedowndata)) return;
    const new_pos = this.mousedowndata.getLocalPosition(this.gfx.parent);
    this.gfx.position.set(new_pos.x + this.offset.x, new_pos.y + this.offset.y);
  };
}
