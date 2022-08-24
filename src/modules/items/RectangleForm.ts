import { deepCopy, mergeProps, openColor } from "../../utils/utils";
import { Graphics, Text } from "pixi.js-legacy";
import {
  Base,
  BaseProps,
  BaseItem,
  ItemType,
  PropColor,
  StrokeColor,
} from "./BaseItem";

export type RectangleStyle = {
  fill: PropColor;
  stroke: StrokeColor;
  radius: number;
  width: number;
  height: number;
};

export type RectangleProps = BaseProps & RectangleStyle;

export const isRectangle = (item: any): item is RectangleProps =>
  (item as RectangleProps).type === "rectangle";

const default_rect_style: RectangleStyle = {
  width: 0,
  height: 0,

  fill: { color: "#000000" },
  stroke: { color: "#000000", size: 0 },

  radius: 0,
};

export class RectangleForm
  extends Graphics
  implements BaseItem<RectangleProps>
{
  readonly base: Base;
  private _styleProps: RectangleStyle;

  constructor(props: Partial<RectangleProps> = {}) {
    super();

    // ensures that the type of this object is itself:
    const p: Partial<RectangleProps> = { ...props, type: "rectangle" };

    // sets base props:
    this.base = new Base(p, this);

    const mergedProps = mergeProps(default_rect_style, p);
    const { width, height, fill, stroke, radius } = mergedProps;
    this._styleProps = { width, height, fill, stroke, radius };

    // console.log(this.getProps());
    this.draw();
    this.interactive = true;

    this.on("pointerdown", () => {
      console.log("rectangle", this.base.id);
    });
  }

  public getProps(): RectangleProps {
    const baseProps = this.base.getBaseProps(this);
    const styleProps = deepCopy(this._styleProps);
    return { ...baseProps, ...styleProps };
  }

  public setProps(props: Partial<RectangleProps>) {
    this.base.setBaseProps(this, props);

    const mergedProps = mergeProps(this.getProps(), props);
    const { width, height, fill, stroke, radius } = mergedProps;
    this._styleProps = { width, height, fill, stroke, radius };
  }

  public syncWithStore() {
    this.base.syncWithStore(this, this.getProps());
  }

  public draw = () => {
    if (this.destroyed) return;

    const { width, height, fill, stroke, radius } = this._styleProps;

    this.removeChildren();
    // this.addChild(new Text(`${this.zOrder}`));

    const f = openColor(fill.color, fill.alpha);
    const fc = f.rgbNumber();
    const fa = f.alpha();

    const s = openColor(stroke.color, stroke.alpha);
    const sc = s.rgbNumber();
    const sa = s.alpha();

    this.clear();
    this.beginFill(fc, fa);
    this.lineStyle({ color: sc, alpha: sa, width: stroke.size });
    this.drawRoundedRect(0, 0, width, height, radius);
    this.endFill();
  };

  get styleProps() {
    return this._styleProps;
  }
}
