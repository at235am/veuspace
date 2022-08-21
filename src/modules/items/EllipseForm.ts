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

export type EllipseStyle = {
  fill: PropColor;
  stroke: StrokeColor;
  width: number;
  height: number;
};

export type EllipseProps = ItemProps & {
  style: EllipseStyle;
};

export type PartialEllipseProps = Partial<Omit<EllipseProps, "style">> & {
  style?: Partial<EllipseStyle>;
};

export const isEllipse = (item: any): item is EllipseProps =>
  (item as EllipseProps).type === "ellipse";

const default_ellipse: EllipseProps = {
  id: "",
  type: "ellipse",

  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  angle: 0,
  zOrder: -1,

  style: {
    width: 0,
    height: 0,

    fill: { color: "#000000" },
    stroke: { color: "#000000", size: 0 },
  },
};

export class EllipseForm extends Graphics implements BaseItem<EllipseProps> {
  public readonly uid: string;
  public readonly type: ItemType;
  private _styleProps: EllipseStyle;

  constructor(props?: PartialEllipseProps) {
    super();

    // MUST DEEP COPY the default options or risk changing default values:
    const defaultOptions = deepCopy(default_ellipse);
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
    this._styleProps = { ...style };

    this.draw();
    this.interactive = true;
  }

  public getProps = () => {
    const { x: px, y: py } = this.position;
    const { x: sx, y: sy } = this.scale;

    const props: EllipseProps = {
      id: this.uid,
      type: this.type,
      zOrder: this.zOrder ?? -1,
      position: { x: px, y: py },
      scale: { x: sx, y: sy },
      angle: this.angle,
      style: { ...this._styleProps },
    };

    return props;
  };

  public setProps = (props: PartialEllipseProps) => {
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
