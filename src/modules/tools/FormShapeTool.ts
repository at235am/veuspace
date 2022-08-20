import { InteractionEvent, InteractionManagerOptions } from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import {
  isRectangle,
  RectangleForm,
  RectangleProps,
  RectangleStyle,
} from "../items/RectangleForm";
import throttle from "lodash.throttle";
import { EllipseForm, EllipseProps, isEllipse } from "../items/EllipseForm";
import { BaseItem } from "../items/BaseItem";

type FormShapeProps = RectangleProps | EllipseProps;

export class FormShapeTool extends BaseTool {
  private dragging: boolean;
  private item: BaseItem;
  private props: FormShapeProps; // use the style property in this object to determine appearance
  private mouseDownPosition?: { x: number; y: number };

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.props = {
      id: "1",
      type: "rectangle",
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      angle: 0,

      style: {
        width: 0,
        height: 0,

        fill: { color: "#000000" },
        stroke: { color: "#000000", size: 0 },
        radius: 3,
      },
    };

    this.item = new RectangleForm();
    this.item.destroy();
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);
    if (blank) return;
    if (!this.interaction) return;

    // attach listeners:
    this.interaction.on("pointerdown", this.startShape);
    this.interaction.on("pointerup", this.drawEnd);
    this.interaction.on("pointerupoutside", this.drawEnd);

    const throttleMove = throttle(this.drawMove, 20, { leading: true });
    this.interaction.on("pointermove", throttleMove);
  }

  setStyles = (options: Partial<FormShapeProps>) => {
    this.props = { ...this.props, ...options };
  };

  startShape = (event: InteractionEvent) => {
    // this handles if the users press down with multiple touches:
    if (this.touches > 1 && !this.item.destroyed) this.item?.destroy();

    // if its not the left click or if multitouching
    if (this.button !== 0 || this.touches > 1) return;

    // state of tool:
    this.dragging = true;

    // const { style } = this.props;

    // let obj: BaseItem;
    // if (type === "rectangle") obj = new RectangleForm(styles);
    // else if (type === "ellipse") obj = new EllipseForm(styles);
    // else obj = new RectangleForm(styles);

    if (isRectangle(this.props)) {
      const { style } = this.props;
      this.item = this.pixi.items.addChild(new RectangleForm({ style }));
    } else if (isEllipse(this.props)) {
      const { style } = this.props;
      this.item = this.pixi.items.addChild(new EllipseForm({ style }));
    }

    // object:
    // this.path = this.pixi.items.addChild(new RectangleForm(styles));
    // this.item = this.pixi.items.addChild(obj);

    // get and add first points:
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    const [X, Y] = [Math.round(x), Math.round(y)];
    this.item.position.set(X, Y);
    this.mouseDownPosition = { x: X, y: Y };
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    if (!this.mouseDownPosition) return;

    const { x: mx, y: my } = this.mouseDownPosition;
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

    if (this.item instanceof RectangleForm) {
      const style = { width, height };
      this.item.setProps({ position: { x: px, y: py }, style });
      this.item.draw();
    } else if (this.item instanceof EllipseForm) {
      const w = width / 2;
      const h = height / 2;

      const style = { width: w, height: h };

      this.item.pivot.set(-w, -h);
      this.item.setProps({ position: { x: px, y: py }, style });
      this.item.draw();
    }
  };

  drawEnd = () => {
    // reset the states of the tool:
    this.dragging = false;

    if (this.item.destroyed) return;

    if (
      this.item instanceof RectangleForm ||
      this.item instanceof EllipseForm
    ) {
      this.item.draw();
      this.item.syncWithStore();

      // this.path.generateHitArea();
      this.item.interactive = true;

      // debug stuff:
      // this.path.drawPoints();
      // this.path.drawHitArea();
    }
  };
}
