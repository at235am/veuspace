import {
  Application,
  autoDetectRenderer,
  Container,
  DisplayObject,
  utils,
} from "pixi.js-legacy";

import { Viewport } from "pixi-viewport";
// import { Stage, Group, Layer } from "@pixi/layers";

import { BaseTool } from "./tools/BaseTool";
import { EraserTool } from "./tools/EraserTool";
import { DrawTool } from "./tools/DrawTool";
import { SelectTool } from "./tools/SelectTool";
import { Background } from "./Background";
import { BrushPath } from "./items/Brush";

import { BaseItem, BaseProps } from "./items/BaseItem";
import { FormShapeTool } from "./tools/FormShapeTool";
import { RectangleForm } from "./items/RectangleForm";
import { EllipseForm } from "./items/EllipseForm";
import { nanoid } from "nanoid";
import { Transformer } from "./Transformer";

utils.skipHello(); // skips the pixi application console.log()

export const TOOL = {
  //                         DESKTOP                     | MOBILE
  SELECT: "select", //       L=tool M=pan R=pan   W=zoom | L1=pan   L2=zoom L3=pan
  ERASE: "erase", //         L=tool M=pan R=erase W=zoom | L1=erase L2=zoom L3=pan
  DRAW: "draw", //           L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  FORM: "form", //           L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  ARROW: "arrow", //         L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  TEXT_ADD: "text_add", //   L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  TEXT_EDIT: "text_edit", // L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  IMAGE: "image", //         L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
} as const;

export type ReverseMap<T> = T[keyof T];
export type Tool = ReverseMap<typeof TOOL>;

export class Items extends Container {
  constructor() {
    super();
  }

  addChildz = (...children: BaseItem[]) => {
    this.addChild(...children);
    children.forEach((item) => {
      // item.parentGroup = this.itemGroup;
      // Default zOrder of a BaseItem is -1.
      // If zOrder is not set (to something other than -1) in the
      // constructor of a BaseItem subclass or in setProps()
      // then we assign a zOrder based on how many items currently exist
      // if (item.zOrder === -1) item.zOrder = this.children.length;
    });

    return children[0];
  };
}

export class PixiApplication {
  public readonly uid: string;
  public app: Application;

  // main containers:
  public background: Background;
  public items: Items;
  public viewport: Viewport;
  public transformer: Transformer;

  // tools:
  public activeTool: BaseTool;
  public drawTool: DrawTool;
  public selectTool: SelectTool;
  public eraserTool: EraserTool;
  public formShapeTool: FormShapeTool;

  // states that have side effects when changed:
  private _mode: Tool;
  public longPressFn?: () => void;

  constructor(canvas?: HTMLCanvasElement, container?: HTMLElement) {
    this._mode = "select";
    this.uid = nanoid(6);

    const box = container?.getBoundingClientRect() || { width: 0, height: 0 };

    console.log("constructor()", this.uid);

    this.app = new Application({
      width: box.width,
      height: box.height,
      resolution: window.devicePixelRatio,
      antialias: true,
      autoDensity: true,
      view: canvas,
      backgroundAlpha: 0,
    });
    // this.app.renderer = autoDetectRenderer();

    // create instances of containers:
    this.items = new Items();
    this.background = new Background(this, 20000, {
      position: true,
      tint: true,
    });
    this.viewport = new Viewport({
      passiveWheel: false,
      disableOnContextMenu: true,
    });

    this.transformer = new Transformer();

    this.transformer.on("pointerdown", () => {
      console.log("from the outside");
    });

    // create instances of tools:
    this.selectTool = new SelectTool(this);
    this.drawTool = new DrawTool(this);
    this.eraserTool = new EraserTool(this);
    this.formShapeTool = new FormShapeTool(this);

    this.activeTool = this.selectTool;
    this.selectTool.activate();

    // name the major containers:
    this.viewport.name = "viewport";
    this.background.name = "background";
    this.items.name = "items";

    // add the containers to the stage (order is important):
    this.viewport.addChild(this.background);
    this.viewport.addChild(this.items);
    this.viewport.addChild(this.transformer);
    this.app.stage.addChild(this.viewport);

    // // set up graphic textures for background (this must be run after we created our new renderer):
    this.background.setupTextures();

    // handle viewport listeners (DO NOT MOVE THIS TO ANY OF THE TOOLS):
    // "moved" is a pixi-viewport only event
    // when theres a "zoomed" pixi-viewport event, there will always be a "moved" event
    // so we can redraw the bg for both zooming and moving the viewport in this one event
    this.viewport
      .on("pointerdow", () => {
        console.log("VIEWPORT DOWN");
      })
      .on("moved", () => {
        console.log("moved");
        // this.transformer.recalcBounds();
      })
      .on("moved", () => this.background.throttledDrawBG())
      .drag({
        mouseButtons: "middle", // can specify combos of "left" | "right" | "middle" clicks
      })
      .wheel({
        trackpadPinch: true,
        wheelZoom: true, // zooms with mouse wheel
        center: null, //    makes it zoom at the pointer position instead of the center
      })
      .clampZoom({
        minScale: 0.2, // how far in  the zoom can be
        maxScale: 10, //  how far out the zoom can be
      })
      .pinch({ noDrag: false }); // "noDrag: false" means enabling two finger drag
  }

  public destroy() {
    console.log("--------------------");
    console.log("destroy()", this.uid);
    // if (!this.app.stage) return;
    // // this.transformer.destroy();

    console.log("transformer d1", this.transformer.destroyed);
    this.selectTool.deactivate();
    this.drawTool.deactivate();
    this.eraserTool.deactivate();
    this.formShapeTool.deactivate();

    this.app.destroy(false, {
      children: true,
      baseTexture: true,
      texture: true,
    });

    console.log("transformer d1", this.transformer.destroyed);
    console.log("--------------------");
  }

  public loadObjects = (items: { [id: string]: BaseProps }) => {
    Object.values(items).forEach((item) => {
      switch (item.type) {
        case "brush-path":
          this.items.addChildz(new BrushPath(item));
          break;
        case "rectangle":
          this.items.addChildz(new RectangleForm(item));
          break;
        case "ellipse":
          this.items.addChildz(new EllipseForm(item));
          break;
        default:
          break;
      }
    });
  };

  public get mode() {
    return this._mode;
  }

  public setMode(value: Tool) {
    if (value === this._mode) return;

    this._mode = value;
    this.activeTool.deactivate();

    switch (value) {
      case TOOL.SELECT:
        this.selectTool.activate();
        break;
      case TOOL.DRAW:
        this.drawTool.activate();
        break;
      case TOOL.ERASE:
        this.eraserTool.activate();
        break;
      case TOOL.FORM:
        this.formShapeTool.activate();
        break;
      default:
        break;
    }
  }

  public setScreenSize(width: number, height: number) {
    this.app.renderer.resize(width, height);
    this.app.view.style.width = `${width}px`;
    this.app.view.style.height = `${height}px`;
    this.viewport.resize(width, height);
    this.background.drawBackgroundPattern();
  }

  public disablePanning() {
    this.viewport.drag({ pressDrag: false, mouseButtons: "middle" });
  }

  public enablePanning() {
    this.viewport.drag({ pressDrag: true, mouseButtons: "middle" });
  }
}
