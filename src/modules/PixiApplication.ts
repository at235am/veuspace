import { SVGScene } from "@pixi-essentials/svg";
import { Viewport } from "pixi-viewport";
import {
  Application,
  autoDetectRenderer,
  Container,
  Graphics,
} from "pixi.js-legacy";
import {
  colorToNumber as ctn,
  roundIntToNearestMultiple,
} from "../utils/utils";
import { FreehandTool } from "./tools/FreehandTool";
import { SelectTool } from "./tools/SelectTool";

export const TOOL = {
  //                         DESKTOP                     | MOBILE
  SELECT: "select", //       L=tool M=pan R=pan   W=zoom | L1=pan   L2=zoom L3=pan
  ERASE: "erase", //         L=tool M=pan R=erase W=zoom | L1=erase L2=zoom L3=pan
  FREEHAND: "freehand", //   L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  SHAPE: "shape", //         L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  CIRCLE: "circle", //       L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  RECTANGLE: "rectangle", // L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  TEXT_ADD: "text_add", //   L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
  TEXT_EDIT: "text_edit", // L=tool M=pan R=erase W=zoom | L1=tool  L2=zoom L3=pan
} as const;

export type ReverseMap<T> = T[keyof T];
export type Tool = ReverseMap<typeof TOOL>;

export class PixiApplication {
  private static instance: PixiApplication;
  private static initialized = false;

  public readonly app: Application;
  public readonly background: Container;
  public readonly items: Container;
  public readonly viewport: Viewport;
  private _mode: Tool;
  private _cellSize: number;
  public longPressFn?: () => void;

  private constructor() {
    this._mode = "select";
    this._cellSize = 60;

    this.app = new Application();
    this.background = new Container();
    this.items = new Container();
    this.viewport = new Viewport({
      // interaction: this.app.renderer.plugins.interaction,
      passiveWheel: false,
      disableOnContextMenu: true,
    });
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

    const select = new SelectTool(this);
    select.activate();
  }

  public get mode() {
    return this._mode;
  }

  public set mode(value: Tool) {
    if (value === this._mode) return;

    this._mode = value;

    switch (value) {
      case TOOL.SELECT:
        const select = new SelectTool(this);
        select.activate();
        break;
      case TOOL.FREEHAND:
        const freehand = new FreehandTool(this);
        freehand.setOptions({ size: 5, color: 0x555555 });
        freehand.activate();
        break;
      case TOOL.CIRCLE:
        break;
      case TOOL.RECTANGLE:
        break;
      default:
        break;
    }
  }

  public get cellSize() {
    return this._cellSize;
  }

  public set cellSize(value: number) {
    if (value === this._cellSize) return;

    this._cellSize = value;
    this.drawBackgroundPattern();
  }

  public resize(width: number, height: number) {
    this.app.renderer.resize(width, height);
    this.app.view.style.width = `${width}px`;
    this.app.view.style.height = `${height}px`;
    this.viewport.resize(width, height);
    this.drawBackgroundPattern();
  }

  public disablePanning() {
    // console.log("disablePanning");
    this.viewport.drag({ pressDrag: false, mouseButtons: "middle" });
  }

  public enablePanning() {
    // console.log("enablePanning");
    this.viewport.drag({ pressDrag: true, mouseButtons: "middle" });
  }

  public drawBackgroundPattern() {
    this.background.removeChildren();
    const cell = this._cellSize; // the gap between each cell of the grid ;
    const pattern = new Graphics();
    // measurements
    const vp_bounds = this.viewport.getVisibleBounds();
    const gridbox = vp_bounds.pad(cell);
    const hboxes = Math.round(gridbox.width / cell);
    const vboxes = Math.round(gridbox.height / cell);
    // for circle:
    pattern.beginFill(ctn(0xffffff), 1);
    pattern.lineStyle({ width: 0 });
    // for rect:
    // pattern.beginFill(0, 0);
    // pattern.lineStyle({ width: 1, color: 0xffffff });
    for (let x = 0; x < hboxes; x++) {
      for (let y = 0; y < vboxes; y++) {
        const offsetX = roundIntToNearestMultiple(vp_bounds.x, cell);
        const offsetY = roundIntToNearestMultiple(vp_bounds.y, cell);
        const X = offsetX + x * cell;
        const Y = offsetY + y * cell;
        pattern.drawCircle(X, Y, 1); // for circle
        // pattern.drawRect(X, Y, cell, cell); // for rect
      }
    }
    pattern.endFill();
    this.background.addChild(pattern);
  }
}
