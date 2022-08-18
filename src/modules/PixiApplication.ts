import { Application, autoDetectRenderer, Container } from "pixi.js-legacy";
import { Viewport } from "pixi-viewport";

import { BaseTool } from "./tools/BaseTool";
import { EraserTool } from "./tools/EraserTool";
import { DrawTool } from "./tools/DrawTool";
import { SelectTool } from "./tools/SelectTool";
import { Background } from "./Background";
import { BrushPath } from "./items/Brush";

import { BaseItem, ItemProps } from "./items/BaseItem";

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

export class PixiApplication {
  private static instance: PixiApplication;
  private static initialized = false;

  // main states:
  public readonly app: Application;
  public readonly background: Background;
  public readonly items: Container;
  // public readonly items: Items;
  public readonly viewport: Viewport;

  // tools:
  public activeTool: BaseTool;
  public readonly drawTool: DrawTool;
  public readonly selectTool: SelectTool;
  public readonly eraserTool: EraserTool;

  private _mode: Tool;
  public longPressFn?: () => void;

  private constructor() {
    this._mode = "select";

    this.app = new Application();
    this.items = new Container();
    // this.items = new Items();
    this.background = new Background(this, 20000, {
      position: true,
      tint: true,
    });

    this.viewport = new Viewport({
      passiveWheel: false,
      disableOnContextMenu: true,
    });

    this.selectTool = new SelectTool(this);
    this.drawTool = new DrawTool(this);
    this.eraserTool = new EraserTool(this);

    this.activeTool = this.selectTool;
  }

  public static getInstance(): PixiApplication {
    if (!PixiApplication.instance)
      PixiApplication.instance = new PixiApplication();
    return PixiApplication.instance;
  }

  public setup(canvas?: HTMLCanvasElement, container?: HTMLElement) {
    if (PixiApplication.initialized) return;

    PixiApplication.initialized = true;

    const box = container?.getBoundingClientRect() || { width: 0, height: 0 };

    // destroy and remake the renderer:
    this.app.renderer.destroy();
    this.app.renderer = autoDetectRenderer({
      width: box.width,
      height: box.height,
      resolution: window.devicePixelRatio,
      antialias: true,
      autoDensity: true,
      view: canvas,
      backgroundAlpha: 0,
    });

    // name the major containers:
    this.viewport.name = "viewport";
    this.background.name = "background";
    this.items.name = "items";

    // add the containers to the stage (order is important):
    this.viewport.addChild(this.background);
    this.viewport.addChild(this.items);
    this.app.stage.addChild(this.viewport);

    this.selectTool.activate();

    // set up graphic textures for background (this must be run after we created our new renderer):
    this.background.setupTextures();

    // handle viewport listeners (DO NOT MOVE THIS TO ANY OF THE TOOLS):
    this.viewport.drag({
      mouseButtons: "middle", // can specify combos of "left" | "right" | "middle" clicks
    });
    this.viewport.wheel({
      trackpadPinch: true,
      // percent: 0.1,
      wheelZoom: true, // zooms with mouse wheel
      center: null, //    makes it zoom at the pointer position instead of the center
    });

    this.viewport.clampZoom({
      minScale: 0.2, // how far in  the zoom can be
      maxScale: 10, //  how far out the zoom can be
    });
    this.viewport.pinch({ noDrag: false }); // "noDrag: false" means enabling two finger drag
    // "moved" is a pixi-viewport only event
    // when theres a "zoomed" pixi-viewport event, there will always be a "moved" event
    // so we can redraw the bg for both zooming and moving the viewport in this one event
    this.viewport.on("moved", () => this.background.throttledDrawBG());
  }

  public loadObjects = (items: { [id: string]: ItemProps }) => {
    Object.entries(items).forEach(([id, item]) => {
      let obj: BaseItem | null = null;
      switch (item.type) {
        case "brush-path":
          obj = new BrushPath(item);
          break;

        default:
          break;
      }

      if (obj) this.items.addChild(obj);
    });
  };

  public get mode() {
    return this._mode;
  }

  public set mode(value: Tool) {
    if (value === this._mode) return;

    this._mode = value;

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
      default:
        break;
    }
  }

  public resize(width: number, height: number) {
    this.app.renderer.resize(width, height);
    this.app.view.style.width = `${width}px`;
    this.app.view.style.height = `${height}px`;
    this.viewport.resize(width, height);
    this.background.drawBackgroundPattern();
  }

  public disablePanning() {
    // console.log("disablePanning");
    this.viewport.drag({ pressDrag: false, mouseButtons: "middle" });
  }

  public enablePanning() {
    // console.log("enablePanning");
    this.viewport.drag({ pressDrag: true, mouseButtons: "middle" });
  }
}
