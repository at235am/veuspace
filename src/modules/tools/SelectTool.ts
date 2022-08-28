import {
  Container,
  Graphics,
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
import { RectangleForm } from "../items/RectangleForm";

export class SelectTool extends BaseTool {
  private boxSelect: BoxSelect;
  private pointerDownPosition: { x: number; y: number };
  private dragging: boolean;
  private shouldTranslate: boolean;
  private shouldRotate: boolean;
  private shouldBoxSelect: boolean;

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.boxSelect = new BoxSelect();
    this.boxSelect.destroy();
    this.pointerDownPosition = { x: 0, y: 0 };

    this.shouldTranslate = false;
    this.shouldRotate = false;
    this.shouldBoxSelect = false;
    this.dragging = false;
  }

  activate(baseEvents = true, options?: InteractionManagerOptions | undefined) {
    super.activate(baseEvents, options);
    if (!this.interaction) return;
    this.boxSelect = this.pixi.viewport.addChild(new BoxSelect());
    this.pixi.items.toggleItemWireframes(true);
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
    this.pixi.items.toggleItemWireframes(false);
    this.pixi.transformer.empty();
    super.deactivate();
  }

  anyHandlesHit = (bools: { [handle: string]: boolean }) =>
    Object.values(bools).some((v) => v);

  selectItem = (event: InteractionEvent) => {
    if (this.touches > 1) {
      this.boxSelect.clear();
      return;
    }
    if (this.button === 1) return;

    const im = this.pixi.app.renderer.plugins.interaction as InteractionManager;

    const itemHit = im.hitTest(event.data.global, this.pixi.items) as BaseItem;
    const inBounds = this.pixi.transformer.isInBounds(event);
    const handleHits = this.pixi.transformer.hitTest();
    const handleHit = this.anyHandlesHit(handleHits); // atleast one handle was hit

    this.shouldTranslate = !handleHit && (!!itemHit || inBounds);
    this.shouldRotate = !!handleHits["rotate"];
    const shouldScale = !!handleHits["cornerTopLeft"];

    const shouldDeSelect = !itemHit && !handleHit && !inBounds;
    this.shouldBoxSelect = shouldDeSelect;

    if (this.shouldRotate) this.pixi.transformer.toggleVisibility(false);

    if (shouldDeSelect) this.pixi.transformer.empty();

    if (itemHit) {
      const alreadySelected = this.pixi.transformer.isAlreadySelected(itemHit);
      if (!alreadySelected) {
        const shift = event.data.originalEvent.shiftKey;
        if (shift) this.pixi.transformer.addToGroup(itemHit);
        else this.pixi.transformer.addOne(itemHit);
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
    if (this.touches > 1) return;
    if (!this.dragging) return;

    if (this.shouldTranslate) {
      const cursor = event.data.getLocalPosition(this.pixi.items);
      // this.pixi.transformer.translateItems(this.pointerDownPosition, cursor);
      this.pixi.transformer.translateItems(cursor, this.pointerDownPosition);
      this.pixi.transformer.recalcBounds();
      /////////////////////////////////////////////////////////////////////////
    } else if (this.shouldRotate) {
      const cursor = event.data.getLocalPosition(this.pixi.items);
      this.pixi.transformer.rotateItems(cursor);
      /////////////////////////////////////////////////////////////////////////
    } else if (this.shouldBoxSelect) {
      const { x: mx, y: my } = this.pointerDownPosition;
      const { x, y } = event.data.getLocalPosition(this.pixi.viewport);

      const shift = event.data.originalEvent.shiftKey;

      let dx = Math.round(x - mx);
      let dy = Math.round(y - my);

      // make the deltas the same if shift is held:
      if (shift) {
        const max = Math.max(Math.abs(dx), Math.abs(dy));
        dx = dx < 0 ? -max : max;
        dy = dy < 0 ? -max : max;
      }

      const width = Math.max(1, Math.abs(dx));
      const height = Math.max(1, Math.abs(dy));

      const px = dx < 0 ? mx + dx : mx;
      const py = dy < 0 ? my + dy : my;

      this.boxSelect.draw(px, py, width, height);

      const items: BaseItem[] = [];

      this.pixi.items.children.forEach((item) => {
        // getBounds() returns the global bounds
        const { x, y, width, height } = item.getBounds();
        const midpoint = {
          x: x + width / 2,
          y: y + height / 2,
        };

        // containsPoint() compares with the global, so make sure we pass in a global position:
        const hit = this.boxSelect.containsPoint(midpoint);
        if (hit) items.push(item as BaseItem);
      });

      this.pixi.transformer.empty();
      this.pixi.transformer.addToGroup(...items);
    }
  };

  selectEnd = () => {
    this.pixi.transformer.syncItems();
    this.pixi.transformer.recalcBounds();
    this.pixi.transformer.toggleVisibility(true);
    this.boxSelect.clear();

    this.dragging = false;
    this.shouldTranslate = false;
    this.shouldRotate = false;
  };
}

class BoxSelect extends Graphics {
  constructor() {
    super();
    this.alpha = 0.25;
  }

  draw = (x: number, y: number, width: number, height: number) => {
    this.clear()
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, width, height)
      .endFill();
    this.position.set(x, y);
  };
}
