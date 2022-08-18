import { Container } from "pixi.js-legacy";

/**
 * ItemProps is the bridge between our react app and our pixi app.
 */
export type ItemProps = {
  id: string;
  type: string;

  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;
};

/**
 * BaseItem is to be used inside our pixi application
 */
export interface BaseItem<T extends ItemProps = ItemProps> extends Container {
  readonly type: string;
  readonly uid: string; // the reason for naming it uid instead of just id is because internally pixijs uses id

  getProps: () => T;
  setProps: (props: Partial<T>) => void;
  syncWithStore: () => void;
}
