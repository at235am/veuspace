import { nanoid } from "nanoid";
import getStroke, { StrokeOptions } from "perfect-freehand";
import { Viewport } from "pixi-viewport";
import {
  Application,
  autoDetectRenderer,
  Container,
  Graphics,
  InteractionEvent,
  InteractionManager,
  Renderer,
} from "pixi.js-legacy";
import {
  colorToNumber as ctn,
  getRandomIntInclusive,
  roundIntToNearestMultiple,
} from "../utils/utils";

export const TOOL = {
  //                         DESKTOP                     | MOBILE
  SELECT: "select", //       L=pan  M=pan R=pan   W=zoom | L1=pan   L2=zoom L3=pan
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
  private static settedup = false;

  public readonly app: Application;
  public readonly background: Container;
  public readonly items: Container;
  private _viewport: Viewport;
  private _mode: Tool;
  private _cellSize: number;

  constructor() {
    this._mode = "select";
    this._cellSize = 60;

    this.app = new Application();
    this._viewport = new Viewport();
    this.background = new Container();
    this.items = new Container();
  }

  public static getInstance(): PixiApplication {
    if (!PixiApplication.instance)
      PixiApplication.instance = new PixiApplication();
    return PixiApplication.instance;
  }

  public setup(canvas?: HTMLCanvasElement, container?: HTMLElement) {
    if (PixiApplication.settedup) return;

    PixiApplication.settedup = true;
    this._viewport.destroy();
    this.app.renderer.destroy();
    const box = container?.getBoundingClientRect() || { width: 0, height: 0 };

    // make the new renderer:
    this.app.renderer = autoDetectRenderer({
      width: box.width,
      height: box.height,
      resolution: window.devicePixelRatio,
      antialias: true,
      autoDensity: true,
      view: canvas,
      backgroundAlpha: 0,
    });

    // make the new viewport
    this._viewport = new Viewport({
      // interaction: this.app.renderer.plugins.interaction,
      passiveWheel: false,
      disableOnContextMenu: true,
    });

    // name the instances:
    this.viewport.name = "viewport";
    this.background.name = "background";
    this.items.name = "items";

    // adding the boxes (order is important):
    this.viewport.addChild(this.background);
    this.viewport.addChild(this.items);
    this.app.stage.addChild(this.viewport);
    this.setSelectListeners();

    const im = this.app.renderer.plugins.interaction as InteractionManager;
    im.on("pointerdown", () => {
      console.log("hello");
    });
  }

  public get viewport() {
    return this._viewport;
  }

  public get mode() {
    return this._mode;
  }

  public set mode(value: Tool) {
    if (value === this._mode) return;

    this._mode = value;
    // this.viewport.removeAllListeners();

    switch (value) {
      case TOOL.SELECT:
        this.enablePanning();
        this.setSelectListeners();
        break;
      case TOOL.FREEHAND:
        this.disablePanning();
        this.setFreehandListener();
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
    // this.viewport.drag({ pressDrag: false, mouseButtons: "all" });
    this.viewport.drag({ pressDrag: true, mouseButtons: "middle" });
  }

  public enablePanning() {
    // console.log("enablePanning");
    this.viewport.drag({ pressDrag: true, mouseButtons: "all" });
  }

  public drawBackgroundPattern() {
    //  const this.background: Container = this.viewport.getChildByName("background");
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

  private setSelectListeners() {
    console.log("settting select listeners");
    // this.viewport.removeAllListeners();
    this.viewport
      .drag({
        mouseButtons: "all", // can specify combos of "left" | "right" | "middle" clicks
      })
      .wheel({
        wheelZoom: true, // zooms with mouse wheel
        center: null, // makes it zoom on pointer
      })
      .clampZoom({
        minScale: 0.3, // minimum scale
        maxScale: 10, // minimum scale
      })
      .pinch({ noDrag: true })
      .on("zoomed", () => this.drawBackgroundPattern()) //    pixi-viewport event only
      .on("moved-end", () => this.drawBackgroundPattern()) // pixi-viewport event only
      .on("pointerdown", (event: InteractionEvent) => {
        console.log("viewport:pointerdown");

        // THIS IS ONLY TRUE if the original event is NOT a TouchEvent
        // event.data.button returns 1 on touch devices WHICH IS NOT the middle click
        let isMiddleClick = event.data.button === 1;
        let touches = 1;

        if (window.TouchEvent) {
          // firefox does not have TouchEvent so we need to check
          // if window.TouchEvent existts before referencing it
          if (event.data.originalEvent instanceof window.TouchEvent) {
            const touchEvent = event.data.originalEvent as TouchEvent;
            touches = touchEvent.touches.length;
            isMiddleClick = false; // since this is
          }
        }
        if (isMiddleClick) return; // to stop the hit test

        // do a hit test:
        const im = this.app.renderer.plugins.interaction as InteractionManager;
        const hit = im.hitTest(event.data.global, this.items);

        if (hit) this.disablePanning();
      })
      .on("pointerup", (event: InteractionEvent) => {
        if (this._mode === TOOL.SELECT) this.enablePanning();
        else this.disablePanning();
      });
  }

  private setFreehandListener() {
    let path = new Graphics();
    let dragging = false;
    let points: number[][] = [];
    let color = 0;
    let newPoint;

    const options: StrokeOptions = {
      size: 10,
      thinning: 0.8,
      smoothing: 0.01,
      streamline: 1,
      easing: (t) => t,
      start: {
        taper: 0,
        cap: true,
      },
      end: {
        taper: 0,
        cap: false,
      },
    };

    this.viewport
      .on("pointerdown", (event: InteractionEvent) => {
        if (this._mode === TOOL.FREEHAND) {
          dragging = true;
          path = new Graphics();
          path.on("pointerdown", (ie: InteractionEvent) => {
            console.log("strokepoly", ie.currentTarget);
          });

          color = getRandomIntInclusive(0, 0xffffff);

          this.items.addChild(path);
          const { x, y } = this.viewport.toWorld(event.data.global);

          // path.position.set(x, y);
          points.push([x, y]);
        }
      })
      .on("pointermove", (event: InteractionEvent) => {
        if (this._mode === TOOL.FREEHAND && dragging) {
          console.log("456");
          const s1 = getStroke(points, options);

          const { x, y } = this.viewport.toWorld(event.data.global);
          points.push([x, y]);

          path.clear();
          path.beginFill(color, 1);
          path.lineStyle({ width: 1, color: 0xffffff });
          // const s = getStroke(points, options);
          // const c = getStrokePoints(points, options);
          // const s = getStrokeOutlinePoints(c, options);
          const s2 = getStroke(points, options);

          // const poly = polygonClipping.difference([s2 as Ring]);
          // const p = poly[0];
          // const s = [...p[0]];
          const s = s2;
          const fs = s.flatMap((i) => i);
          path.drawPolygon(fs);

          // path.drawShape(new Polygon(fs));
          // path.finishPoly();
          // path.closePath();
          path.endFill();
        }
      })
      .on("pointerup", () => {
        if (this._mode === TOOL.FREEHAND) {
          // console.log(path.)
          // path.destroy();
          // const finalPath = new Graphics();
          // const s = getStroke(points, {
          //   ...options,
          //   end: {
          //     taper: true,
          //     cap: false,
          //   },
          // });
          // const fs = s.flatMap((i) => i);
          // finalPath.beginFill(color, 1);
          // finalPath.drawPolygon(fs);
          // finalPath.endFill();
          // items.current?.addChild(finalPath);
          // path.interactive = true;
          dragging = false;
          points = [];
        }
      });
  }
}
