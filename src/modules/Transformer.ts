import {
  Container,
  Graphics,
  InteractionEvent,
  Rectangle,
} from "pixi.js-legacy";

import "@pixi/math-extras";
import { BaseItem } from "./items/BaseItem";
import { angleBetweenTwoPoints, CPoint, rotate, round10 } from "../utils/utils";
import { RectangleForm } from "./items/RectangleForm";

type BaseItemMap = { [id: string]: ItemWrapper };

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

    if (bounds.width === 0 || bounds.height === 0) return;
    const boundz = bounds.clone().pad(padding);

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

    this.rotateHandle.beginFill(0xffffff, 1).drawCircle(0, 0, 6).endFill();
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

class ItemWrapper {
  public refItem: BaseItem;
  public originalPoint: { x: number; y: number };
  public originalAngle: number;

  constructor(item: BaseItem) {
    this.refItem = item;
    this.originalPoint = { x: item.x, y: item.y };
    this.originalAngle = item.angle;
  }

  public updateOriginalPoint = () => {
    this.originalPoint = { x: this.refItem.x, y: this.refItem.y };
  };

  public updateOriginalAngle = () => {
    this.originalAngle = this.refItem.angle;
  };
}

export class Transformer extends Container {
  private items: BaseItemMap;
  private wireframe: Wireframe;
  private _boundingBox: Rectangle;
  private _center: { x: number; y: number };

  constructor() {
    super();

    this.items = {};
    this._boundingBox = Rectangle.EMPTY;
    this._center = { x: 0, y: 0 };
    this.interactive = true;

    this.wireframe = new Wireframe();

    this.addChild(this.wireframe);
  }

  get boundingBox() {
    return this._boundingBox;
  }

  get center() {
    return this._center;
  }

  public addToGroup(...items: BaseItem[]) {
    items.forEach((item) => {
      this.items[item.base.id] = new ItemWrapper(item);
      if (item instanceof RectangleForm) {
        console.log("hey");
        item.toggleSelected(true);
      }
    });
    this.recalcBounds();
  }

  public addOne(item: BaseItem) {
    this.items = {};
    this.addToGroup(item);
  }

  // public remove(item: BaseItem) {
  //   const id = item.base.id;
  //   const toDelete = this.items[id];
  //   if (toDelete) delete this.items[id];
  //   this.recalcBounds();
  // }

  public empty() {
    Object.values(this.items).forEach((item) => {
      if (item.refItem instanceof RectangleForm) {
        item.refItem.toggleSelected(false);
      }
    });
    this.items = {};
    this.recalcBounds();
  }

  public generateBounds = () => {
    const items = Object.values(this.items);
    if (items.length === 0) return Rectangle.EMPTY;

    let rect = items[0].refItem.getBounds();

    items.forEach((item) => {
      rect.union(item.refItem.getBounds(), rect);
    });

    return rect;
  };

  public generateCenter = () => {
    const { x, y, width, height } = this._boundingBox;
    return { x: x + width / 2, y: y + height / 2 };
  };

  public recalcBounds = () => {
    this._boundingBox = this.generateBounds();
    this._center = this.generateCenter();
    this.draw();
  };

  public draw() {
    this.wireframe.draw(this._boundingBox);
  }

  public isInBounds(event: InteractionEvent) {
    const bounds = this.generateBounds();
    const { x, y } = event.data.global;
    return bounds.contains(x, y);
  }

  public isAlreadySelected(item: BaseItem) {
    return !!this.items[item.base.id];
  }

  public translateItems(
    cursorPosition: { x: number; y: number },
    pointerDownPosition: { x: number; y: number }
  ) {
    const { x: px, y: py } = pointerDownPosition;
    const { x: cx, y: cy } = cursorPosition;

    Object.values(this.items).forEach((item) => {
      const { x: ox, y: oy } = item.originalPoint;
      const offset = { x: ox - px, y: oy - py };

      item.refItem.x = round10(cx + offset.x);
      item.refItem.y = round10(cy + offset.y);
    });
  }

  public rotateItems = (cursorPosition: CPoint, pivotPoint?: CPoint) => {
    const items = Object.values(this.items);
    if (items.length === 0) return;

    // this line of code is assuming that each item in "items" are all in the same container
    // which is true since we designed the application in such a way
    const localCenter = items[0].refItem.parent.toLocal(this._center);
    const pivot = pivotPoint ?? localCenter;
    const angle = (angleBetweenTwoPoints(pivot, cursorPosition) + 90) % 360;

    items.forEach((item) => {
      // the translation due to rotating about the pivot (the center by default):
      const { x, y } = rotate(pivot, item.originalPoint, angle);
      item.refItem.position.x = round10(x);
      item.refItem.position.y = round10(y);

      // the tilting of the item:
      item.refItem.angle = round10((item.originalAngle + angle) % 360);
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

  public updateOriginalAngles = () => {
    Object.values(this.items).forEach((obj) => {
      obj.updateOriginalAngle();
    });
  };

  public toggleVisibility = (value?: boolean) => {
    const toggleValue = this.wireframe.alpha ^ 1;
    const numValue = value ? 1 : 0;
    this.wireframe.alpha = value === undefined ? toggleValue : numValue;
  };
}
