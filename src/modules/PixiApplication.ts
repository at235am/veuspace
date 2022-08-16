import { SVGScene } from "@pixi-essentials/svg";
import { Viewport } from "pixi-viewport";
import {
  Application,
  autoDetectRenderer,
  Container,
  Graphics,
  ParticleContainer,
  Point,
  RenderTexture,
  SCALE_MODES,
  Sprite,
} from "pixi.js-legacy";
import {
  clamp,
  colorToNumber as ctn,
  roundIntToNearestMultiple,
} from "../utils/utils";
import { BaseTool } from "./tools/BaseTool";
import { EraserTool } from "./tools/EraserTool";
import { DrawTool } from "./tools/DrawTool";
import { SelectTool } from "./tools/SelectTool";
import throttle from "lodash.throttle";

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
  public readonly background: ParticleContainer;
  // public readonly background: Container;
  public readonly items: Container;
  public readonly viewport: Viewport;

  // tools:
  public activeTool: BaseTool;
  public readonly drawTool: DrawTool;
  public readonly selectTool: SelectTool;
  public readonly eraserTool: EraserTool;

  private _mode: Tool;
  private _grid: boolean;
  private _cellSize: number;
  private _backgroundPattern: { type: string; color: string };
  private _patterns?: { [type: string]: RenderTexture };
  public longPressFn?: () => void;

  private constructor() {
    this._mode = "select";
    this._cellSize = 50;
    this._grid = true;
    this._backgroundPattern = { type: "dot", color: "#000000" };

    // this._patternDot = new Sprite();

    this.app = new Application();
    // this.background = new Container();
    this.background = new ParticleContainer(20000, {
      position: true,
      tint: true,
    });
    this.items = new Container();
    this.viewport = new Viewport({
      passiveWheel: false,
      disableOnContextMenu: true,
    });

    this.selectTool = new SelectTool(this);
    this.drawTool = new DrawTool(this);
    this.eraserTool = new EraserTool(this);

    this.activeTool = this.selectTool;

    this.drawTool.setOptions({ size: 5, color: 0x555555 });
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

    const dotPattern = new Graphics();
    dotPattern.beginFill(0xffffff, 1);
    dotPattern.lineStyle({ width: 0 });
    dotPattern.drawCircle(0, 0, 1);
    dotPattern.endFill();

    const gridPattern = new Graphics();
    gridPattern.beginFill(0xffffff, 1);
    gridPattern.lineStyle({ width: 0 });
    gridPattern.drawRect(0, 0, this._cellSize, 1);
    gridPattern.drawRect(0, 0, 1, this._cellSize);
    gridPattern.endFill();
    // gridPattern.alpha = 0.1;

    this._patterns = {
      dot: this.app.renderer.generateTexture(dotPattern),
      grid: this.app.renderer.generateTexture(gridPattern),
    };

    this._patterns.dot.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    this._patterns.grid.baseTexture.scaleMode = SCALE_MODES.NEAREST;

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
    this.viewport.on("moved", () => this.throttledDrawBG());
  }

  public get grid() {
    return this._grid;
  }

  public set grid(value: boolean) {
    this._grid = value;
    if (value) this.drawBackgroundPattern();
    else this.background.removeChildren();
  }

  public get cellSize() {
    return this._cellSize;
  }

  public set cellSize(value: number) {
    if (value === this._cellSize) return;
    this._cellSize = value;
    this.drawBackgroundPattern();
  }

  public get backgroundPattern() {
    return this._backgroundPattern;
  }

  public set backgroundPattern(
    value: Partial<{ type: string; color: string }>
  ) {
    this._backgroundPattern = { ...this._backgroundPattern, ...value };
    this.drawBackgroundPattern();
  }

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

  public drawBackgroundPattern(force = false) {
    if (!this._grid && !force) return;

    this.background.removeChildren();
    const { color, type } = this._backgroundPattern;
    const cell = this._cellSize; // the gap between each cell of the grid ;

    const bounds = this.viewport.getVisibleBounds().pad(cell * 2);
    const hboxes = Math.round(bounds.width / cell);
    const vboxes = Math.round(bounds.height / cell);

    const pattern = this._patterns ? this._patterns[type] : undefined;
    if (pattern) {
    }

    const zoomscale = this.viewport.scaled;
    const scale = Math.round(clamp(1 / zoomscale, 1, 2) * 100) / 100;

    for (let x = 0; x < hboxes; x++) {
      for (let y = 0; y < vboxes; y++) {
        const offsetX = roundIntToNearestMultiple(bounds.x, cell);
        const offsetY = roundIntToNearestMultiple(bounds.y, cell);
        const X = offsetX + x * cell;
        const Y = offsetY + y * cell;

        const sprite = new Sprite(pattern);
        sprite.position.set(X, Y);
        sprite.scale.set(scale, scale);

        this.background.addChild(sprite);
      }
    }
    this.background.tint = ctn(color);
    // this.background.scale = new Point(zoomscale, zoomscale);
  }

  public throttledDrawBG = throttle(this.drawBackgroundPattern, 100);
}
