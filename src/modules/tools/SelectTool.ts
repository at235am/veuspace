import {
  InteractionData,
  InteractionEvent,
  InteractionManager,
  InteractionManagerOptions,
} from "pixi.js-legacy";
import { BaseItem } from "../items/BaseItem";
import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import throttle from "lodash.throttle";
export class SelectTool extends BaseTool {
  private dragging: boolean;

  private offset: { x: number; y: number };
  private item: BaseItem | null;

  private mousedowndata: InteractionData | null;

  private dragPoint: { x: number; y: number } = { x: 0, y: 0 };

  // private transformer: Transformer;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    console.log("contructor() SelectTool");
    super(pixi, longPressCallback);

    this.dragging = false;
    this.mousedowndata = null;
    this.offset = { x: 0, y: 0 };
    this.item = null;

    // this.transformer.interactive = true;
    // this.pixi.app.stage.addChild(this.transformer);
  }

  // drawTransformer = () => {
  //   if (this.pixi.transformer) this.pixi.transformer.draw();
  // };

  activate(baseEvents = true, options?: InteractionManagerOptions | undefined) {
    super.activate(baseEvents, options);
    if (!this.interaction) return;

    // this.pixi.app.ticker.add(this.drawTransformer);

    // this.transformer = new Transformer();
    // this.transformer.interactive = true;
    // this.pixi.app.stage.addChild(this.transformer);

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    // this.interaction.on("pointerdown", this.debug);
    this.interaction.on("pointerdown", this.selectItem);
    this.interaction.on("pointerup", this.selectEnd);
    this.interaction.on("pointerupoutside", this.selectEnd);

    const throttleMove = throttle(this.selectionMove, 20);
    // this.interaction.on("pointermove", throttleMove);
  }

  deactivate() {
    this.pixi.transformer.empty();
    // this.pixi.app.ticker.remove(this.drawTransformer);

    super.deactivate();
  }

  debug = () => {
    if (this.button === 2) {
      console.log(this.pixi.items.children);
    }
  };

  selectItem = (event: InteractionEvent) => {
    if (this.button === 1) return;

    // console.log("---------------------------------");
    console.log("selectItem");

    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;
    this.item = im.hitTest(event.data.global, this.pixi.items) as BaseItem;

    const hitHandles = im.hitTest(event.data.global, this.pixi.transformer);
    const inBounds = this.pixi.transformer.isInBounds(event);

    const dontDeSelect = hitHandles || inBounds;

    if (!this.item && !dontDeSelect) {
      this.pixi.transformer.empty();
      // this.transformer.empty();
      return;
    }

    // if (!this.item) {
    //   if (!inBounds) this.transformer.empty();
    // }
    if (this.item) {
      console.log("hit an item");
      const alreadySelected = this.pixi.transformer.isAlreadySelected(
        this.item
      );
      if (!alreadySelected) {
        const shift = event.data.originalEvent.shiftKey;

        if (shift) {
          this.pixi.transformer.addToGroup(this.item);
          // this.transformer.addToGroup(this.item);
        } else {
          this.pixi.transformer.addOne(this.item);
          // this.transformer.addOne(this.item);
        }
      }
      // console.log("here");

      // this.pixi.transformer.draw();

      // this.item.parentLayer = this.pixi.transformLayer;

      // this.item.alpha = 0.8;
      const lp = event.data.getLocalPosition(this.pixi.transformer);
      // const lp = event.data.getLocalPosition(this.transformer);
      this.offset = { x: this.item.x - lp.x, y: this.item.y - lp.y };
      // const lp = event.data.getLocalPosition(this.item.parent);
      // this.offset = { x: this.item.x - lp.x, y: this.item.y - lp.y };
    }

    this.pixi.disablePanning();
    this.mousedowndata = event.data;
    this.dragPoint = { x: event.data.global.x, y: event.data.global.y };
    this.dragging = true;
  };

  selectEnd = (event: InteractionEvent) => {
    // console.log("end");
    if (this.item) {
      // this.item.parentLayer = this.pixi.itemLayer;

      // this.item.alpha = 1;
      this.item.syncWithStore();
    }

    this.dragging = false;
    this.mousedowndata = null;
    this.item = null;
    // this.pixi.transformer = undefined;
  };

  selectionMove = (event: InteractionEvent) => {
    if (!(this.dragging && this.mousedowndata)) return;
    // console.log("move");

    console.log("moveee");

    // const new_pos = this.mousedowndata.getLocalPosition(this.pixi.transformer);

    // const prev = this.dragPoint;
    // const curr = { x: event.data.global.x, y: event.data.global.y };
    // const dx = curr.x - prev.x;
    // const dy = curr.y - prev.y;
    // this.dragPoint = curr;
    // this.pixi.transformer.translate(dx, dy);

    if (this.item) {
      // const new_pos = this.mousedowndata.getLocalPosition(this.item.parent);
      // this.item.position.set(
      //   new_pos.x + this.offset.x,
      //   new_pos.y + this.offset.y
      // );
      // console.log(this.pixi.transformLayer.children);
      // this.pixi.transformLayer.position.set(
      //   new_pos.x + this.offset.x,
      //   new_pos.y + this.offset.y
      // );
    }
  };
}
