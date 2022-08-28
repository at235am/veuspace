import { deepCopy, mergeProps, openColor, round10 } from "../../utils/utils";
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
  private wireframe: Graphics;

  private _wireframeVisible: boolean;
  private _selected: boolean;
  private _hovering: boolean;

  constructor(props: Partial<RectangleProps> = {}) {
    super();

    // ensures that the type of this object is itself:
    const p: Partial<RectangleProps> = { ...props, type: "rectangle" };

    // sets base props:
    this.base = new Base(p, this);
    this.wireframe = this.addChild(new Graphics());

    this._wireframeVisible = true; // controls whether or not hover actions
    this._selected = false;
    this._hovering = false;
    this.toggleWireframe(this._wireframeVisible);

    const mergedProps = mergeProps(default_rect_style, p);
    const { width, height, fill, stroke, radius } = mergedProps;
    this._styleProps = { width, height, fill, stroke, radius };

    this.draw();
    this.interactive = true;
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

    // this.removeChildren();
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
    // this.lineStyle({ color: sc, alpha: 0.1, width: 2 });
    this.drawRoundedRect(0, 0, width, height, radius);
    this.endFill();

    // if (this._showWireframe) this.drawWireframe();
  };

  public drawWireframe = () => {
    const { width, height, fill, stroke, radius } = this._styleProps;

    const onePixel = 2 / this.parent.worldTransform.a;

    this.wireframe
      .clear()
      .beginFill(0xff0000)
      .drawRoundedRect(0, 0, width, height, radius)
      .beginHole()
      .drawRoundedRect(
        onePixel,
        onePixel,
        width - onePixel * 2,
        height - onePixel * 2,
        radius
      )
      .endHole()
      .endFill();
  };

  public refreshWireframe = () => {
    const shouldDraw =
      this._wireframeVisible && (this._selected || this._hovering);

    if (shouldDraw) this.drawWireframe();
    else this.wireframe.clear();
  };

  pointerOver = () => {
    this.toggleHover(true);
  };

  pointerOut = () => {
    this.toggleHover(false);
  };

  get styleProps() {
    return this._styleProps;
  }

  get wireframeVisible() {
    return this._wireframeVisible;
  }

  toggleWireframe(value?: boolean) {
    this._wireframeVisible =
      value === undefined ? !this._wireframeVisible : value;

    if (this._wireframeVisible) {
      this.on("pointerover", this.pointerOver);
      this.on("pointerout", this.pointerOut);
    } else {
      this.removeListener("pointerover", this.pointerOver);
      this.removeListener("pointerout", this.pointerOut);
    }
    this.refreshWireframe();
  }

  get selected() {
    return this._selected;
  }

  toggleSelected = (value?: boolean) => {
    this._selected = value === undefined ? !this._selected : value;
    this.refreshWireframe();
  };

  private toggleHover = (value?: boolean) => {
    this._hovering = value === undefined ? !this._hovering : value;
    this.refreshWireframe();
  };
}
