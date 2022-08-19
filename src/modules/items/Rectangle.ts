import { colorToNumber as ctn, deepCopy } from "../../utils/utils";
import { Graphics, LINE_CAP, LINE_JOIN, Polygon } from "pixi.js-legacy";
import { BaseItem, ItemProps } from "./BaseItem";

import { nanoid } from "nanoid";
import { usePaperStore } from "../../store/PaperStore";
import { FormShape } from "../tools/FormShapeTool";

export type RectangleStyleProps = {
  shape: FormShape;

  fillColor: string | number;
  fillAlpha: number;

  strokeColor: string | number;
  strokeSize: number;
  radius: number;
};

export type RectangleProps = RectangleStyleProps &
  ItemProps & {
    width: number;
    height: number;
  };

const default_rectangle_props: RectangleProps = {
  id: "",
  type: "rectangle-shape",
  shape: "rectangle",

  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  angle: 0,

  width: 100,
  height: 100,

  fillColor: "#000000",
  fillAlpha: 1,
  strokeColor: "#000000",
  strokeSize: 0,
  radius: 0,
};

export class RectangleShape
  extends Graphics
  implements BaseItem<RectangleProps>
{
  public readonly uid: string;
  public readonly type: string;
  private dimensions: { width: number; height: number };
  protected styleProps: RectangleStyleProps;

  constructor(options?: Partial<RectangleProps>) {
    super();

    // MUST DEEP COPY the default options or risk changing default values:
    const defaultOptions = deepCopy(default_rectangle_props);

    const {
      id,
      type,
      shape,

      position,
      scale,
      angle,

      width,
      height,

      fillColor,
      fillAlpha,
      strokeColor,
      strokeSize,
      radius,
    } = Object.assign(defaultOptions, options);

    this.type = type;
    this.uid = id || nanoid();

    this.position = position;
    this.scale = scale;
    this.angle = angle;

    this.dimensions = { width, height };
    this.styleProps = {
      fillColor,
      fillAlpha,
      strokeColor,
      strokeSize,
      radius,
      shape,
    };

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

      width: this.width,
      height: this.height,
      ...this.styleProps,
    };

    return props;
  };

  public setProps = (props: Partial<RectangleProps>) => {
    const currentProps = this.getProps();

    const {
      angle,
      fillColor,
      fillAlpha,
      position,
      scale,
      strokeColor,
      strokeSize,
      width,
      height,
      radius,
      shape,
    } = Object.assign(currentProps, props);

    this.position.set(position.x, position.y);
    this.scale.set(scale.x, scale.y);
    this.angle = angle;

    this.dimensions = { width, height };
    this.styleProps = {
      fillColor,
      fillAlpha,
      strokeColor,
      strokeSize,
      radius,
      shape,
    };
  };

  public syncWithStore() {
    const { removeItem, setItem } = usePaperStore.getState();
    if (this.destroyed) removeItem(this.getProps());
    else setItem(this.getProps());
  }

  public draw = () => {
    if (this.destroyed) return;

    const { width, height } = this.dimensions;
    const { fillColor, fillAlpha, strokeColor, strokeSize, radius } =
      this.styleProps;

    this.clear();

    this.beginFill(ctn(fillColor), fillAlpha);
    this.lineStyle({ color: ctn(strokeColor), width: strokeSize });
    this.drawRoundedRect(0, 0, width, height, radius);
    this.endFill();
  };
}
