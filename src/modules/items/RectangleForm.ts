import { deepCopy, openColor } from "../../utils/utils";
import { Graphics } from "pixi.js-legacy";
import {
  BaseItem,
  ItemProps,
  ItemType,
  PropColor,
  StrokeColor,
} from "./BaseItem";

import { nanoid } from "nanoid";
import { usePaperStore } from "../../store/PaperStore";

export type RectangleStyle = {
  fill: PropColor;
  stroke: StrokeColor;
  radius: number;
  width: number;
  height: number;
};

export type RectangleProps = ItemProps & {
  style: RectangleStyle;
};

export type PartialRectangleProps = Partial<Omit<RectangleProps, "style">> & {
  style?: Partial<RectangleStyle>;
};

export const isRectangle = (item: any): item is RectangleProps =>
  (item as RectangleProps).type === "rectangle";

const default_rectangle: RectangleProps = {
  id: "",
  type: "rectangle",

  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  angle: 0,

  style: {
    width: 0,
    height: 0,

    fill: { color: "#000000" },
    stroke: { color: "#000000", size: 0 },

    radius: 0,
  },
};

export class RectangleForm
  extends Graphics
  implements BaseItem<RectangleProps>
{
  public readonly uid: string;
  public readonly type: ItemType;
  private _styleProps: RectangleStyle;

  constructor(props?: PartialRectangleProps) {
    super();

    // MUST DEEP COPY the default options or risk changing default values:
    const defaultOptions = deepCopy(default_rectangle);
    const defaultStyle = deepCopy(defaultOptions.style);

    const opts = deepCopy(props || {});
    const optsStyle = deepCopy(opts.style ?? defaultStyle);

    const mergedProps = {
      ...defaultOptions,
      ...opts,
      style: { ...defaultStyle, ...optsStyle }, // merging styles
    };

    const { type, id, position, scale, angle, style } = mergedProps;

    // set identifying props:
    this.type = type;
    this.uid = id || nanoid();

    // set pixi props:
    this.position = position;
    this.scale = scale;
    this.angle = angle;

    // set appearance props:
    this._styleProps = style;

    this.draw();
    this.interactive = true;
  }

  public getProps = () => {
    const { x: px, y: py } = this.position;
    const { x: sx, y: sy } = this.scale;

    const props: RectangleProps = {
      id: this.uid,
      type: this.type,
      position: { x: px, y: py },
      scale: { x: sx, y: sy },
      angle: this.angle,
      style: { ...this._styleProps },
    };

    return props;
  };

  public setProps = (props: PartialRectangleProps) => {
    const currentProps = deepCopy(this.getProps());
    const currentStyle = deepCopy(currentProps.style);

    const newProps = deepCopy(props);
    const newStyle = deepCopy(newProps.style ?? currentStyle);

    const mergedProps = {
      ...currentProps,
      ...newProps,
      style: { ...currentStyle, ...newStyle }, // merging styles
    };
    const { position, scale, angle, style } = mergedProps;

    // set pixi props:
    this.position = position;
    this.scale = scale;
    this.angle = angle;

    // set appearance props:
    this._styleProps = { ...style };
  };

  public syncWithStore() {
    const { removeItem, setItem } = usePaperStore.getState();
    if (this.destroyed) removeItem(this.getProps());
    else setItem(this.getProps());
  }

  public draw = () => {
    if (this.destroyed) return;

    const { width, height, fill, stroke, radius } = this._styleProps;

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
