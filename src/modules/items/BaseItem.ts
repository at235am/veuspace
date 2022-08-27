import { nanoid } from "nanoid";
import { Container, DisplayObject } from "pixi.js-legacy";
import { usePaperStore } from "../../store/PaperStore";
import { deepCopy, mergeProps } from "../../utils/utils";

/**
 * A PropColor represents a color that will be stored in a database, retrieved, and could be used in css.
 * Therefore, we allow only strings as the color (as opposed to allowing numbers too).
 * To use this color with pixi, call openColor() in utils.
 */
export interface PropColor {
  color: string;
  alpha?: number;
  pattern?: string;
}

export type StrokeColor = PropColor & {
  size: number;
};

export type ItemType =
  | "brush-path"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "line"
  | "arrow"
  | "";

/**
 * ItemProps is the bridge between our react app and our pixi app.
 */
export type BaseProps = {
  id: string;
  type: ItemType;

  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;

  zOrder: number;
};

const default_props: BaseProps = {
  id: "",
  type: "",

  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  angle: 0,
  zOrder: -1,
};

export class Base {
  readonly type: ItemType;
  readonly id: string;

  constructor(props: Partial<BaseProps>, obj: DisplayObject) {
    const defaultOptions = deepCopy(default_props);
    const opts = deepCopy(props);

    const mergedProps = {
      ...defaultOptions,
      ...opts,
    };

    const { type, id, position, scale, angle, zOrder } = mergedProps;

    this.type = type;
    this.id = id || nanoid();

    obj.position = position;
    obj.scale = scale;
    obj.angle = angle;
    // obj.zOrder = zOrder;
  }

  public getBaseProps(obj: DisplayObject) {
    const { x: px, y: py } = obj.position;
    const { x: sx, y: sy } = obj.scale;

    const props: BaseProps = {
      id: this.id,
      type: this.type,
      position: { x: px, y: py },
      scale: { x: sx, y: sy },
      angle: obj.angle,
      // zOrder: obj.zOrder ?? -1,
      zOrder: 0,
    };

    return props;
  }

  public setBaseProps(obj: DisplayObject, props: Partial<BaseProps>) {
    const currentProps = deepCopy(this.getBaseProps(obj));
    const newProps = deepCopy(props);

    const mergedProps = { ...currentProps, ...newProps };
    const { position, scale, angle, zOrder } = mergedProps;

    // set pixi props:
    obj.position = position;
    obj.scale = scale;
    obj.angle = angle;
    // obj.zOrder = zOrder;
  }

  public syncWithStore(obj: DisplayObject, itemProps: BaseProps) {
    const { removeItem, setItem } = usePaperStore.getState();
    if (obj.destroyed) removeItem(itemProps);
    else setItem(itemProps);
  }
}

/**
 * BaseItem is to be used inside our pixi application
 */
export interface BaseItem<T extends BaseProps = BaseProps> extends Container {
  readonly base: Base;

  getProps: () => T;
  setProps: (props: Partial<T>) => void;
  syncWithStore: () => void;
}
