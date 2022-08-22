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

export type EllipseStyle = {
  fill: PropColor;
  stroke: StrokeColor;

  width: number;
  height: number;
};

export type EllipseProps = BaseProps & EllipseStyle;

export const isEllipse = (item: any): item is EllipseProps =>
  (item as EllipseProps).type === "ellipse";

const default_ellipse_style: EllipseStyle = {
  width: 0,
  height: 0,
  fill: { color: "#000000" },
  stroke: { color: "#000000", size: 0 },
};

export class EllipseForm extends Graphics implements BaseItem<EllipseProps> {
  readonly base: Base;
  private _styleProps: EllipseStyle;

  constructor(props: Partial<EllipseProps> = {}) {
    super();

    // ensures that the type of this object is itself:
    const p: Partial<EllipseProps> = { ...props, type: "ellipse" };

    // sets base props:
    this.base = new Base(p, this);

    const mergedProps = mergeProps(default_ellipse_style, p);
    const { width, height, fill, stroke } = mergedProps;
    this._styleProps = { width, height, fill, stroke };

    this.draw();
    this.interactive = true;
  }

  public getProps() {
    const baseProps = this.base.getBaseProps(this);
    const styleProps = deepCopy(this._styleProps);
    return { ...baseProps, ...styleProps };
  }

  public setProps(props: Partial<EllipseProps>) {
    this.base.setBaseProps(this, props);

    const mergedProps = mergeProps(this.getProps(), props);
    const { width, height, fill, stroke } = mergedProps;
    this._styleProps = { width, height, fill, stroke };
  }

  public syncWithStore() {
    this.base.syncWithStore(this, this.getProps());
  }

  public draw = () => {
    if (this.destroyed) return;

    // const { width, height } = this._dimensions;
    const { fill, stroke, width, height } = this._styleProps;

    const f = openColor(fill.color, fill.alpha);
    const fc = f.rgbNumber();
    const fa = f.alpha();

    const s = openColor(stroke.color, stroke.alpha);
    const sc = s.rgbNumber();
    const sa = s.alpha();

    this.clear();
    this.beginFill(fc, fa);
    this.lineStyle({ color: sc, alpha: sa, width: stroke.size });
    this.drawEllipse(0, 0, width, height);
    this.endFill();
  };

  get styleProps() {
    return this._styleProps;
  }
}
