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
import { angleBetweenTwoPoints } from "../../utils/utils";
export class SelectTool extends BaseTool {
  private pointerDownPosition: { x: number; y: number };
  private dragging: boolean;
  private shouldTranslate: boolean;
  private shouldRotate: boolean;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.shouldTranslate = false;
    this.shouldRotate = false;
    this.dragging = false;
    this.pointerDownPosition = { x: 0, y: 0 };
  }

  activate(baseEvents = true, options?: InteractionManagerOptions | undefined) {
    super.activate(baseEvents, options);
    if (!this.interaction) return;

    // handle viewport listeners:
    this.pixi.enablePanning();

    // attach global listeners:
    this.interaction.on("pointerdown", this.selectItem);
    this.interaction.on("pointerup", this.selectEnd);
    this.interaction.on("pointerupoutside", this.selectEnd);
    this.interaction.on("pointermove", this.selectionMove);
    // const throttleMove = throttle(this.selectionMove, 20);
    // this.interaction.on("pointermove", throttleMove);
  }

  deactivate() {
    this.pixi.transformer.empty();
    super.deactivate();
  }

  anyHandlesHit = (bools: { [handle: string]: boolean }) =>
    Object.values(bools).some((v) => v);

  selectItem = (event: InteractionEvent) => {
    if (this.button === 1) return;

    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;

    const itemHit = im.hitTest(event.data.global, this.pixi.items) as BaseItem;
    const inBounds = this.pixi.transformer.isInBounds(event);
    const handleHits = this.pixi.transformer.hitTest();
    const handleHit = this.anyHandlesHit(handleHits); // atleast one handle was hit

    this.shouldTranslate = !handleHit && (!!itemHit || inBounds);
    this.shouldRotate = !!handleHits["rotate"];
    const shouldScale = !!handleHits["cornerTopLeft"];

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
    this.pixi.transformer.updateOriginalAngles();
    this.dragging = true;
  };

  selectionMove = (event: InteractionEvent) => {
    // if (!(this.dragging && this.pointerDownData)) return;
    if (!this.dragging) return;

    if (this.shouldTranslate) {
      const cp = event.data.getLocalPosition(this.pixi.items);
      this.pixi.transformer.translateItems(this.pointerDownPosition, cp);
      this.pixi.transformer.recalcBounds();
    }
    if (this.shouldRotate) {
      this.pixi.transformer.toggleVisibility(false);
      const fp = this.pixi.items.toLocal(this.pixi.transformer.center);
      const cp = event.data.getLocalPosition(this.pixi.items);
      const angle = (angleBetweenTwoPoints(fp, cp) + 90) % 360;
      this.pixi.transformer.rotateItems(angle, fp);
    }
  };

  selectEnd = () => {
    this.pixi.transformer.syncItems();
    this.pixi.transformer.recalcBounds();
    this.pixi.transformer.toggleVisibility(true);

    this.dragging = false;
    this.shouldTranslate = false;
    this.shouldRotate = false;
  };
}
