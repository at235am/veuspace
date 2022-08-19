import { colorToNumber as ctn, round10 } from "../../utils/utils";

import { InteractionEvent, InteractionManagerOptions } from "pixi.js-legacy";

import { PixiApplication } from "../PixiApplication";
import { BaseTool } from "./BaseTool";
import { RectangleShape, RectangleStyleProps } from "../items/Rectangle";
import throttle from "lodash.throttle";

export type FormShape = "rectangle" | "circle" | "triangle";

export class FormShapeTool extends BaseTool {
  private dragging: boolean;
  private path: RectangleShape;
  private style: RectangleStyleProps;
  private mouseDownPosition?: { x: number; y: number };

  constructor(pixi: PixiApplication, longPressCallback?: () => void) {
    super(pixi, longPressCallback);

    this.dragging = false;
    this.style = {
      fillAlpha: 1,
      fillColor: 0x222222,
      strokeColor: 0xffffff,
      strokeSize: 1,
      radius: 3,
      shape: "rectangle",
    };

    this.path = new RectangleShape();
    this.path.destroy();
  }

  activate(blank = false, options?: InteractionManagerOptions | undefined) {
    super.start(false, options);
    if (blank) return;
    if (!this.interaction) return;

    // attach listeners:
    this.interaction.on("pointerdown", this.startRectangle);
    this.interaction.on("pointerup", this.drawEnd);
    this.interaction.on("pointerupoutside", this.drawEnd);

    const throttleMove = throttle(this.drawMove, 20, { leading: true });
    this.interaction.on("pointermove", throttleMove);
  }

  setStyles = (options: Partial<RectangleStyleProps>) => {
    this.style = { ...this.style, ...options };
  };

  startRectangle = (event: InteractionEvent) => {
    // this handles if the users press down with multiple touches:
    if (this.touches > 1 && !this.path.destroyed) this.path?.destroy();

    // if its not the left click or if multitouching
    if (this.button !== 0 || this.touches > 1) return;

    // state of tool:
    this.dragging = true;
    // const { fillColor, strokeColor, strokeSize } = this.options;

    // object:
    this.path = this.pixi.items.addChild(new RectangleShape(this.style));

    // get and add first points:
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);
    const [X, Y] = [Math.round(x), Math.round(y)];
    this.path.position.set(X, Y);
    this.mouseDownPosition = { x: X, y: Y };
  };

  drawMove = (event: InteractionEvent) => {
    if (!this.dragging || this.longPressed || this.touches > 1) return;
    if (!this.mouseDownPosition) return;

    const { x: mx, y: my } = this.mouseDownPosition;
    const { x, y } = event.data.getLocalPosition(this.pixi.viewport);

    const dx = Math.round(x - mx);
    const dy = Math.round(y - my);

    const px = dx < 0 ? mx + dx : mx;
    const py = dy < 0 ? my + dy : my;
    const width = Math.max(1, Math.abs(dx));
    const height = Math.max(1, Math.abs(dy));

    this.path.setProps({ width, height, position: { x: px, y: py } });

    this.path.draw();
  };

  drawEnd = () => {
    // reset the states of the tool:
    this.dragging = false;

    if (this.path.destroyed) return;

    this.path.draw();
    // this.path.syncWithStore();

    // this.path.generateHitArea();
    this.path.interactive = true;

    // debug stuff:
    // this.path.drawPoints();
    // this.path.drawHitArea();
  };
}
