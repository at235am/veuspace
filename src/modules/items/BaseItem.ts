import { Container } from "pixi.js-legacy";

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
  | "arrow";

/**
 * ItemProps is the bridge between our react app and our pixi app.
 */
export type ItemProps = {
  id: string;
  type: ItemType;

  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
};

/**
 * BaseItem is to be used inside our pixi application
 */
export interface BaseItem<T extends ItemProps = ItemProps> extends Container {
  readonly type: ItemType;
  readonly uid: string; // the reason for naming it uid instead of just id is because internally pixijs uses id

  getProps: () => T;
  setProps: (props: Partial<T>) => void;
  syncWithStore: () => void;
}
