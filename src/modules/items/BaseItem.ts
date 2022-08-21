import { nanoid } from "nanoid";
import { Container, DisplayObject, Graphics, Sprite } from "pixi.js-legacy";
import { usePaperStore } from "../../store/PaperStore";
import { deepCopy } from "../../utils/utils";

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
export type ItemProps = {
  id: string;
  type: ItemType;

  position: { x: number; y: number };
  scale: { x: number; y: number };
  angle: number;

  zOrder: number;
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

const default_props: ItemProps = {
  id: "",
  type: "",

  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  angle: 0,
  zOrder: -1,
};

class Base<T extends ItemProps> {
  readonly type: ItemType;
  readonly uid: string;
  // private props: T;

  constructor(props: Partial<T>, obj: DisplayObject) {
    // super();

    const defaultOptions = deepCopy(default_props);
    // const defaultStyle = deepCopy(defaultOptions.style);

    const opts = deepCopy(props || {});
    // const optsStyle = deepCopy(opts.style ?? defaultStyle);

    const mergedProps = {
      ...defaultOptions,
      ...opts,
      // style: { ...defaultStyle, ...optsStyle }, // merging styles
    };

    const { type, id, position, scale, angle, zOrder } = mergedProps;

    this.type = type;
    this.uid = id || nanoid();

    obj.position = position;
    obj.scale = scale;
    obj.angle = angle;
    obj.zOrder = zOrder;
  }

  public getProps = (obj: DisplayObject) => {
    const { x: px, y: py } = obj.position;
    const { x: sx, y: sy } = obj.scale;

    const props: ItemProps = {
      id: this.uid,
      type: this.type,
      position: { x: px, y: py },
      scale: { x: sx, y: sy },
      angle: obj.angle,
      zOrder: obj.zOrder ?? -1,
      // style: { ...this._styleProps },
    };

    return props;
  };

  public setProps = (obj: DisplayObject, props: Partial<T>) => {
    const currentProps = deepCopy(this.getProps(obj));
    // const currentStyle = deepCopy(currentProps.style);

    const newProps = deepCopy(props);
    // const newStyle = deepCopy(newProps.style ?? currentStyle);

    const mergedProps = {
      ...currentProps,
      ...newProps,
      // style: { ...currentStyle, ...newStyle }, // merging styles
    };
    const { position, scale, angle, zOrder } = mergedProps;

    // set pixi props:
    obj.position = position;
    obj.scale = scale;
    obj.angle = angle;

    obj.zOrder = zOrder;

    // set appearance props:
    // this._styleProps = { ...style };
  };

  public syncWithStore(obj: DisplayObject, itemProps: T) {
    const { removeItem, setItem } = usePaperStore.getState();
    if (obj.destroyed) removeItem(itemProps);
    else setItem(itemProps);
  }
}

class BaseGraphic extends Graphics {
  text() {
    // this.type
    // this.id
    // this.getId
  }
}

class BaseSprite extends Sprite {}

// class Base<T extends ItemProps> {
//   readonly type: ItemType;
//   readonly uid: string;
//   // private props: T;

//   constructor(props: Partial<T>, obj: DisplayObject) {
//     // super();

//     const defaultOptions = deepCopy(default_props);
//     // const defaultStyle = deepCopy(defaultOptions.style);

//     const opts = deepCopy(props || {});
//     // const optsStyle = deepCopy(opts.style ?? defaultStyle);

//     const mergedProps = {
//       ...defaultOptions,
//       ...opts,
//       // style: { ...defaultStyle, ...optsStyle }, // merging styles
//     };

//     const { type, id, position, scale, angle, zOrder } = mergedProps;

//     this.type = type;
//     this.uid = id || nanoid();

//     obj.position = position;
//     obj.scale = scale;
//     obj.angle = angle;
//     obj.zOrder = zOrder;
//   }

//   public getProps = (obj: DisplayObject) => {
//     const { x: px, y: py } = obj.position;
//     const { x: sx, y: sy } = obj.scale;

//     const props: ItemProps = {
//       id: this.uid,
//       type: this.type,
//       position: { x: px, y: py },
//       scale: { x: sx, y: sy },
//       angle: obj.angle,
//       zOrder: obj.zOrder ?? -1,
//       // style: { ...this._styleProps },
//     };

//     return props;
//   };

//   public setProps = (obj: DisplayObject, props: Partial<T>) => {
//     const currentProps = deepCopy(this.getProps(obj));
//     // const currentStyle = deepCopy(currentProps.style);

//     const newProps = deepCopy(props);
//     // const newStyle = deepCopy(newProps.style ?? currentStyle);

//     const mergedProps = {
//       ...currentProps,
//       ...newProps,
//       // style: { ...currentStyle, ...newStyle }, // merging styles
//     };
//     const { position, scale, angle, zOrder } = mergedProps;

//     // set pixi props:
//     obj.position = position;
//     obj.scale = scale;
//     obj.angle = angle;

//     obj.zOrder = zOrder;

//     // set appearance props:
//     // this._styleProps = { ...style };
//   };

//   public syncWithStore(obj: DisplayObject, itemProps: T) {
//     const { removeItem, setItem } = usePaperStore.getState();
//     if (obj.destroyed) removeItem(itemProps);
//     else setItem(itemProps);
//   }
// }

// class BaseGraphic extends Base<any> {}

// const Base = {
//   type: "",
//   uid: "",
//   setProps : function <T>(props: Partial<T>, obj: Container) {
//     // super();

//     const defaultOptions = deepCopy(default_props);
//     // const defaultStyle = deepCopy(defaultOptions.style);

//     const opts = deepCopy(props);
//     // const optsStyle = deepCopy(opts.style ?? defaultStyle);

//     const mergedProps = {
//       ...defaultOptions,
//       ...opts,
//       // style: { ...defaultStyle, ...optsStyle }, // merging styles
//     };

//     const { type, id, position, scale, angle, zOrder } = mergedProps;

//     this.type = type;
//     this.uid = id || nanoid();

//     obj.position = position;
//     obj.scale = scale;
//     obj.angle = angle;
//     obj.zOrder = zOrder;
//   }
// }

// class Rect extends Graphics {
//   extras: Base<ItemProps>;

//   constructor(props?: Partial<ItemProps>) {
//     super();
//     this.extras = new Base(props ?? {}, this);
//   }
// }

// class Rect2 extends Rect {
//   constructor(props?: Partial<ItemProps>) {
//     super(props);

//     // this(props);
//   }
// }

// class RectGraphic

// class Rect extends Graphics, Base{

// }

// // Each mixin is a traditional ES class
// class Jumpable {
//   jump() {
//     console.log("jumped");
//   }
// }

// class Duckable {
//   duck() {
//     console.log("ducked");
//   }
// }

// // Including the base
// class Sprite {
//   x = 0;
//   y = 0;

//   constructor() {
//     // super();
//   }

//   cool() {
//     // this.
//   }
// }

// // Then you create an interface which merges
// // the expected mixins with the same name as your base
// interface Sprite extends Jumpable, Duckable {}
// // Apply the mixins into the base class via
// // the JS at runtime
// applyMixins(Sprite, [Jumpable, Duckable]);

// let player = new Sprite();
// player.jump();
// console.log(player.x, player.y);

// // This can live anywhere in your codebase:
// function applyMixins(derivedCtor: any, constructors: any[]) {
//   constructors.forEach((baseCtor) => {
//     Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//       Object.defineProperty(
//         derivedCtor.prototype,
//         name,
//         Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
//           Object.create(null)
//       );
//     });
//   });
// }
