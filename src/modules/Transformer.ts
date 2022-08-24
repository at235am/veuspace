// import { Layer } from "@pixi/layers";
import {
  Bounds,
  Container,
  DisplayObject,
  Graphics,
  InteractionEvent,
  LineStyle,
  Rectangle,
} from "pixi.js-legacy";

import "@pixi/math-extras";
import { BaseItem } from "./items/BaseItem";
import { Items } from "./PixiApplication";
import { isRectangle, RectangleForm } from "./items/RectangleForm";
import { EllipseForm } from "./items/EllipseForm";
import { nanoid } from "nanoid";

type BaseItemMap = { [id: string]: BaseItem };

class ShadowContainer extends Container {
  constructor() {
    super();

    this.interactive = false;
  }

  draw() {
    // const { x, y, width, height } = this.getBounds(true);
    // this.border.clear();
    // this.border
    //   .beginFill(0xffff00, 0)
    //   .lineStyle({ color: 0xffff00, width: 1 })
    //   .drawRect(x, y, width, height)
    //   .endFill();
    // this.position.set(x, y);
  }

  addShadowItem(item: BaseItem) {
    // const { x, y, width, height } = this.getBounds();
    // const { x, y } = item.position;
    // const { width, height, angle } = item;
    // const g = new Graphics();
    // g.position.set(x, y);
    // g.beginFill(0, 0)
    //   .lineStyle({ color: 0xff00ff, width: 1 })
    //   .drawRect(0, 0, width, height)
    //   .endFill();
    // this.addChild(g);
  }

  updateShadowItems(...items: BaseItem[]) {
    // this
  }
}

class Wireframe extends Container {
  private boundzBox: Graphics;
  private rotateHandle: Graphics;
  private border: Graphics;
  private pivotPoint: Graphics;

  constructor() {
    console.log("constructor() Wireframe");

    super();

    this.border = this.addChild(new Graphics());
    this.boundzBox = this.addChild(new Graphics());
    this.rotateHandle = this.addChild(new Graphics());
    this.pivotPoint = this.addChild(new Graphics());

    this.interactive = true;
    this.boundzBox.interactive = false;
    this.rotateHandle.interactive = true;

    // this.doListeners();
  }

  private help(event: InteractionEvent) {
    // event.stopPropagation();
    // console.log(event);
    console.log("pointerdown rorate");
  }

  private doListeners() {
    this.rotateHandle.on("pointerdown", this.help);
    this.rotateHandle.on("pointerup", () => {
      console.log("up");
    });
  }

  public draw(bounds: Rectangle, padding = 5) {
    console.log("drawing");
    // clear at the beginning:
    this.border.clear();
    this.pivotPoint.clear();
    this.rotateHandle.clear();

    // this.box.clear();

    const boundz = bounds.clone();
    if (boundz.width === 0 || boundz.height === 0) return;

    const { x, y, width, height } = boundz.pad(padding);
    this.position.set(x, y);

    this.pivotPoint
      .beginFill(0xff00ff, 1)
      .drawCircle(width / 2, height / 2, 5)
      .endFill();

    this.border.beginFill(0xff0000, 0);
    this.border.lineStyle({ color: 0xffffff, width: 2 });
    this.border.drawRect(0, 0, width, height);
    this.border.endFill();

    this.border.beginFill(0xff00ff, 0);
    this.border.lineStyle({ color: 0xff00ff, width: 2 });
    // Object.values(this.items).forEach((i) => {
    //   // console.log(i.tog)

    //   // const d = i.getBounds(true);
    //   const d = i._bounds.getRectangle();
    //   this.g.drawRect(d.x - x, d.y - y, d.width, d.height);
    // });
    this.border.endFill();

    // this.box.beginFill(0xffffff, 1);
    // this.box.drawRect(0, 0, width, height);
    // this.box.endFill();
    // this.box.alpha = 0.5;

    this.rotateHandle.beginFill(0xffffff, 1).drawCircle(0, 0, 10);
    this.rotateHandle.endFill();
    this.rotateHandle.position.set(width / 2, -25);
  }

  // destroy() {
  //   console.log("destroy() Wireframe");
  //   console.log(this.rotateHandle.listeners("pointerdown"));

  //   this.rotateHandle.removeAllListeners();

  //   console.log(this.rotateHandle.listeners("pointerdown"));

  //   super.destroy(true);
  // }

  // rotateItems() {}
}

export class Transformer extends Container {
  private uid: string;
  private items: BaseItemMap;

  private boundz: Rectangle;

  // private shadows: ShadowContainer;
  // private wireframe: Wireframe;

  private g: Graphics;

  constructor() {
    super();

    this.uid = nanoid(5);
    console.log("constructor() Transformer", this.uid);

    this.g = new Graphics();
    this.addChild(this.g);
    this.g.interactive = true;
    this.g.on("pointerdown", () => {
      console.log("graphics", this.uid);
    });

    this.items = {};
    this.boundz = Rectangle.EMPTY;
    this.interactive = true;

    // this.wireframe = new Wireframe();
    // // this.shadows = new ShadowContainer();

    // this.addChild(this.wireframe);
    // // this.addChild(this.shadows);

    this.on("pointerdown", () => {
      console.log("pointerdown Transformer", this.uid);
    });

    this.draw();
  }

  private moveToTransformLayer(item: BaseItem) {
    // item.parentLayer = this.transformLayer;
  }

  private moveToItemlayer(item: BaseItem) {
    // item.parentLayer = this.itemLayer;
  }

  public addShadowItem(item: BaseItem) {
    const { position, id, angle, scale } = item.getProps();

    // const shadow = this.addChild(new Graphics());
    // shadow.position.set();
  }

  public removeShadowItem(item: BaseItem) {}

  public addToGroup(...items: BaseItem[]) {
    console.log("addToGroup()");

    items.forEach((item) => {
      const id = item.base.id;

      // this.shadows.addShadowItem(item);
      this.items[id] = item;
    });
    this.recalcBounds();
  }

  public addOne(item: BaseItem) {
    console.log("addOne()");

    // this.shadows.addShadowItem(item);

    this.items = {};
    this.items[item.base.id] = item;
    this.recalcBounds();
  }

  public remove(item: BaseItem) {
    console.log("remove()");

    const id = item.base.id;
    const toDelete = this.items[id];
    if (toDelete) {
      // this.itemsContainer.addChildz(toDelete);
      delete this.items[id];
    }
    this.recalcBounds();
  }

  public empty() {
    console.log("empty()");
    Object.values(this.items).forEach((item) => {
      this.moveToItemlayer(item);
      // this.itemsContainer.addChildz(item);
    });
    this.items = {};
    this.recalcBounds();
  }

  public generateBounds() {
    const items = Object.values(this.items);
    if (items.length === 0) return Rectangle.EMPTY;

    let rect = items[0].getBounds(true);

    items.forEach((item) => {
      this.moveToTransformLayer(item);
      rect.union(item.getBounds(), rect);
    });

    return rect;
  }

  public recalcBounds() {
    // this.itemContainer.draw();
    // console.log("hello");

    this.boundz = this.generateBounds();
    this.draw();
  }

  public draw() {
    // this.wireframe.draw(this.boundz);

    this.g.clear().beginFill(0xff00ff).drawRect(0, 0, 50, 50).endFill();
  }

  public isInBounds(event: InteractionEvent) {
    const bounds = this.generateBounds();
    const { x, y } = event.data.global;

    return bounds.contains(x, y);
  }

  public isAlreadySelected(item: BaseItem) {
    return !!this.items[item.base.id];
  }

  public translate(dx: number, dy: number) {
    // Object.values(this.items).forEach((item) => {
    //   item.position.x += dx;
    //   item.position.y += dy;
    // });
  }

  public rotateItems() {
    console.log("rotateitems");
  }

  // public destroy() {
  //   console.log("destroy() Transformer");

  //   super.destroy({ children: true });
  // }
}
