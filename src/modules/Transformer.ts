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
import { rotate } from "../utils/utils";
import Color from "color";

type BaseItemMap = { [id: string]: ItemWrapper };

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

class Handle extends Graphics {
  private _isHit: boolean;
  private _mainColor: number;
  private _hoverColor: number;

  constructor(name: string, mainColor: number, hoverColor: number) {
    super();
    this.name = name;
    this._mainColor = mainColor;
    this._hoverColor = hoverColor;
    this._isHit = false;
    this.interactive = true;

    this.on("pointerover", () => {
      this.tint = this._hoverColor;
    })
      .on("pointerout", () => {
        this.tint = this._mainColor;
      })
      .on("pointerdown", () => {
        this._isHit = true;
      })
      .on("pointerup", () => {
        this._isHit = false;
      })
      .on("pointerupoutside", () => {
        this._isHit = false;
      });
  }

  get isHit() {
    return this._isHit;
  }

  set mainColor(color: number) {
    this._mainColor = color;
  }

  set hoverColor(color: number) {
    this._mainColor = color;
  }
}

class Wireframe extends Container {
  private mainColor: number;
  private hoverColor: number;

  private boundzBox: Graphics;
  private centerPoint: Graphics;

  // HANDLES:
  private rotateHandle: Handle;

  // border pieces:
  private borderLeft: Handle;
  private borderRight: Handle;
  private borderTop: Handle;
  private borderBottom: Handle;

  // corner pieces:
  private cornerTopLeft: Handle;
  private cornerTopRight: Handle;
  private cornerBottomRight: Handle;
  private cornerBottomLeft: Handle;

  constructor() {
    super();

    this.mainColor = 0xffffff;
    this.hoverColor = 0xff00ff;

    this.boundzBox = this.addChild(new Graphics());

    this.centerPoint = this.addChild(new Graphics());

    this.rotateHandle = this.createHandle("rotate");
    this.borderRight = this.createHandle("borderRight");
    this.borderLeft = this.createHandle("borderLeft");
    this.borderTop = this.createHandle("borderTop");
    this.borderBottom = this.createHandle("borderBottom");
    this.cornerTopLeft = this.createHandle("cornerTopLeft");
    this.cornerTopRight = this.createHandle("cornerTopRight");
    this.cornerBottomRight = this.createHandle("cornerBottomRight");
    this.cornerBottomLeft = this.createHandle("cornerBottomLeft");

    this.interactive = true;
    this.boundzBox.interactive = false;
    this.rotateHandle.interactive = true;
  }

  public createHandle = (name: string) => {
    return this.addChild(new Handle(name, this.mainColor, this.hoverColor));
  };

  public draw(bounds: Rectangle, padding = 4) {
    // clear at the beginning:
    this.centerPoint.clear();
    this.rotateHandle.clear();
    this.borderLeft.clear();
    this.borderRight.clear();
    this.borderTop.clear();
    this.borderBottom.clear();
    this.cornerTopLeft.clear();
    this.cornerTopRight.clear();
    this.cornerBottomRight.clear();
    this.cornerBottomLeft.clear();

    // this.pivotPoint.beginFill(0xff00ff, 1).drawRect(0, 0, 5, 5).endFill();

    const boundz = bounds.clone().pad(padding);
    if (boundz.width === 0 || boundz.height === 0) return;

    const x = Math.round(boundz.x);
    const y = Math.round(boundz.y);
    const width = Math.round(boundz.width);
    const height = Math.round(boundz.height);

    this.pivot.set(width / 2, height / 2);
    this.position.set(x + width / 2, y + height / 2);

    this.centerPoint
      .beginFill(0xffffff, 1)
      .drawCircle(width / 2, height / 2, 5)
      .endFill();

    this.rotateHandle.beginFill(0xffffff, 1).drawCircle(0, 0, 5);
    this.rotateHandle.endFill();
    this.rotateHandle.position.set(width / 2, -25);

    this.borderTop
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, width, 1)
      .endFill();

    this.borderBottom
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, width, 1)
      .endFill()
      .position.set(0, height - 1);

    this.borderLeft
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, 1, height)
      .endFill()
      .position.set(0, 0);

    this.borderRight
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, 1, height)
      .endFill()
      .position.set(width - 1, 0);

    const hitPad = 8;
    const rb = this.borderRight.getBounds().pad(hitPad, 0);
    this.borderRight.hitArea = new Rectangle(-hitPad, 0, rb.width, rb.height);
    const lb = this.borderLeft.getBounds().pad(hitPad, 0);
    this.borderLeft.hitArea = new Rectangle(-hitPad, 0, lb.width, lb.height);
    const tb = this.borderTop.getBounds().pad(0, hitPad);
    this.borderTop.hitArea = new Rectangle(0, -hitPad, tb.width, tb.height);
    const bb = this.borderBottom.getBounds().pad(0, hitPad);
    this.borderBottom.hitArea = new Rectangle(0, -hitPad, bb.width, bb.height);
    // const rbb = this.rightBorder.getBounds().pad(8, -8);
    // this.rightBorder.hitArea = new Rectangle(-8, 8, rbb.width, rbb.height);

    const cornerSize = 8;
    this.cornerTopLeft
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, cornerSize, cornerSize)
      .endFill();
    this.cornerTopLeft.position.set(1, 1);
    this.cornerTopLeft.pivot.set(cornerSize / 2, cornerSize / 2);

    this.cornerTopRight
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, cornerSize, cornerSize)
      .endFill();
    this.cornerTopRight.position.set(width - 1, 1);
    this.cornerTopRight.pivot.set(cornerSize / 2, cornerSize / 2);

    this.cornerBottomRight
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, cornerSize, cornerSize)
      .endFill();
    this.cornerBottomRight.position.set(width - 1, height - 1);
    this.cornerBottomRight.pivot.set(cornerSize / 2, cornerSize / 2);

    this.cornerBottomLeft
      .beginFill(0xffffff)
      .lineStyle({ width: 0 })
      .drawRect(0, 0, cornerSize, cornerSize)
      .endFill();
    this.cornerBottomLeft.position.set(1, height - 1);
    this.cornerBottomLeft.pivot.set(cornerSize / 2, cornerSize / 2);
  }

  public hitTest() {
    return {
      [this.rotateHandle.name]: this.rotateHandle.isHit,
      [this.borderLeft.name]: this.borderLeft.isHit,
      [this.borderRight.name]: this.borderRight.isHit,
      [this.borderTop.name]: this.borderTop.isHit,
      [this.borderBottom.name]: this.borderBottom.isHit,
      [this.cornerTopLeft.name]: this.cornerTopLeft.isHit,
      [this.cornerTopRight.name]: this.cornerTopRight.isHit,
      [this.cornerBottomRight.name]: this.cornerBottomRight.isHit,
      [this.cornerBottomLeft.name]: this.cornerBottomLeft.isHit,
    };
  }
}

export class ItemWrapper {
  public refItem: BaseItem;
  public originalPoint: { x: number; y: number };
  constructor(item: BaseItem) {
    this.refItem = item;
    this.originalPoint = { x: item.x, y: item.y };
  }

  public updateOriginalPoint = () => {
    this.originalPoint = { x: this.refItem.x, y: this.refItem.y };
  };
}

export class Transformer extends Container {
  // private items: BaseItemMap;
  private items: BaseItemMap;
  private boundz: Rectangle;

  private shadows: ShadowContainer;
  private wireframe: Wireframe;

  constructor() {
    super();

    this.items = {};
    this.boundz = Rectangle.EMPTY;
    this.interactive = true;

    this.wireframe = new Wireframe();
    this.shadows = new ShadowContainer();

    this.addChild(this.wireframe);
    this.addChild(this.shadows);

    this.on("pointerdown", () => {
      console.log("pointerdown Transformer");
    });
  }

  public addShadowItem(item: BaseItem) {
    const { position, id, angle, scale } = item.getProps();
  }

  public removeShadowItem(item: BaseItem) {}

  public addToGroup(...items: BaseItem[]) {
    // console.log("addToGroup()");

    items.forEach((item) => {
      const id = item.base.id;

      // this.items[id] = item;
      this.items[id] = new ItemWrapper(item);
    });
    this.recalcBounds();
  }

  public addOne(item: BaseItem) {
    this.items = {};
    // this.items[item.base.id] = item;
    this.items[item.base.id] = new ItemWrapper(item);
    this.recalcBounds();
  }

  public remove(item: BaseItem) {
    // console.log("remove()");

    const id = item.base.id;
    const toDelete = this.items[id];
    if (toDelete) {
      delete this.items[id];
    }
    this.recalcBounds();
  }

  public empty() {
    this.items = {};
    this.recalcBounds();
  }

  public generateBounds() {
    const items = Object.values(this.items);
    if (items.length === 0) return Rectangle.EMPTY;

    let rect = items[0].refItem.getBounds(true);

    items.forEach((item) => {
      rect.union(item.refItem.getBounds(), rect);
    });

    return rect;
  }

  public recalcBounds = () => {
    // this.itemContainer.draw();
    // console.log("hello");

    this.boundz = this.generateBounds();
    this.draw();
  };

  public draw() {
    this.wireframe.draw(this.boundz);

    // this.g.clear().beginFill(0xff00ff).drawRect(0, 0, 50, 50).endFill();
  }

  public isInBounds(event: InteractionEvent) {
    const bounds = this.generateBounds();
    const { x, y } = event.data.global;
    return bounds.contains(x, y);
  }

  public isAlreadySelected(item: BaseItem) {
    return !!this.items[item.base.id];
  }

  public translate(
    pointerDownPosition: { x: number; y: number },
    currentPointerPosition: { x: number; y: number }
  ) {
    const { x: px, y: py } = pointerDownPosition;
    const { x: cx, y: cy } = currentPointerPosition;

    Object.values(this.items).forEach((item) => {
      const { x: ox, y: oy } = item.originalPoint;
      const offset = { x: ox - px, y: oy - py };

      item.refItem.x = cx + offset.x;
      item.refItem.y = cy + offset.y;
    });
  }

  public rotateItems = () => {
    const items = Object.values(this.items);
    if (items.length === 0) return;

    const { x, y, width, height } = this.boundz;
    const pivot = { x: x + width / 2, y: y + height / 2 };

    const localPivot = items[0].refItem.parent.toLocal(pivot);
    console.log(localPivot);

    items.forEach((item) => {
      const { x, y } = rotate(localPivot, item.refItem.position, 30);
      item.refItem.position.set(x, y);
      item.refItem.angle = (item.refItem.angle + 30) % 360;
    });
  };

  public syncItems = () => {
    Object.values(this.items).forEach((item) => item.refItem.syncWithStore());
  };

  public hitTest() {
    return this.wireframe.hitTest();
  }

  public updateOriginalPositions = () => {
    Object.values(this.items).forEach((obj) => {
      obj.updateOriginalPoint();
    });
  };
}
