import { Container } from "pixi.js-legacy";

export interface BaseItem<T> extends Container {
  type: string;
  getData: () => T;
}
