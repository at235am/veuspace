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
  // private pointerDownData: InteractionData | null;
  private pointerDownPosition: { x: number; y: number };

  private shouldTranslate: boolean;
  private shouldRotate: boolean;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.shouldTranslate = false;
    this.shouldRotate = false;
    this.dragging = false;
    // this.pointerDownData = null;
    this.pointerDownPosition = { x: 0, y: 0 };
    // this.item = null;
  }

  activate(baseEvents = true, options?: InteractionManagerOptions | undefined) {
    super.activate(baseEvents, options);
    if (!this.interaction) return;

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    // this.interaction.on("pointerdown", this.debug);
    this.interaction.on("pointerdown", this.selectItem);
    this.interaction.on("pointerup", this.selectEnd);
    this.interaction.on("pointerupoutside", this.selectEnd);

    // const throttleMove = throttle(this.selectionMove, 20);
    // this.interaction.on("pointermove", throttleMove);
    this.interaction.on("pointermove", this.selectionMove);
  }

  deactivate() {
    this.pixi.transformer.empty();
    super.deactivate();
  }

  debug = () => {
    if (this.button === 2) {
      console.log(this.pixi.items.children);
    }
  };

  anyHandlesHit = (bools: { [handle: string]: boolean }) =>
    Object.values(bools).some((v) => v);

  selectItem = (event: InteractionEvent) => {
    console.log("selectItem");
    if (this.button === 1) return;

    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;

    const itemHit = im.hitTest(event.data.global, this.pixi.items) as BaseItem;
    const inBounds = this.pixi.transformer.isInBounds(event);
    const handleHits = this.pixi.transformer.hitTest();
    const handleHit = this.anyHandlesHit(handleHits); // atleast one handle was hit

    this.shouldTranslate = !handleHit && (!!itemHit || inBounds);
    this.shouldRotate = !!handleHits["rotate"];
    const shouldScale = !!handleHits["cornerTopLeft"];

    if (this.shouldRotate) this.pixi.transformer.rotateItems();

    const dontDeSelect = handleHit || inBounds;

    if (!itemHit && !dontDeSelect) {
      this.pixi.transformer.empty();
      return;
    }

    if (itemHit) {
      const alreadySelected = this.pixi.transformer.isAlreadySelected(itemHit);
      if (!alreadySelected) {
        const shift = event.data.originalEvent.shiftKey;

        if (shift) {
          this.pixi.transformer.addToGroup(itemHit);
        } else {
          this.pixi.transformer.addOne(itemHit);
        }
      }
    }
    this.pixi.disablePanning();
    this.pointerDownPosition = event.data.getLocalPosition(this.pixi.items);
    this.pixi.transformer.updateOriginalPositions();
    this.dragging = true;
    // this.pointerDownData = event.data;
  };

  selectionMove = (event: InteractionEvent) => {
    // if (!(this.dragging && this.pointerDownData)) return;
    if (!this.dragging) return;

    if (this.shouldTranslate) {
      const cp = event.data.getLocalPosition(this.pixi.items);
      this.pixi.transformer.translate(this.pointerDownPosition, cp);
      this.pixi.transformer.recalcBounds();
    }
  };

  selectEnd = (event: InteractionEvent) => {
    this.pixi.transformer.syncItems();

    this.dragging = false;
    this.shouldTranslate = false;
    this.shouldRotate = false;
    // this.pointerDownData = null;

    // this.item = null;
  };
}
