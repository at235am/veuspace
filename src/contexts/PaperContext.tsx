import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";

import { nanoid } from "nanoid";
import { colorToNumber as clr, getRandomIntInclusive } from "../utils/utils";

import { getRandomIntInclusive as randomInt } from "../utils/utils";

import { Viewport } from "pixi-viewport";

import {
  Application,
  autoDetectRenderer,
  CanvasRenderer,
  Container,
  Graphics,
  InteractionData,
  InteractionEvent,
  InteractionManager,
  Rectangle,
  Renderer,
} from "pixi.js-legacy";

// utils:
import { clamp, roundIntToNearestMultiple } from "../utils/utils";

import useUpdatedState from "../hooks/useUpdatedState";
import getStroke, { getStrokePoints, StrokeOptions } from "perfect-freehand";

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

export type CircleOptions = {
  name?: string;
  x?: number;
  y?: number;
  radius?: number;
  color?: string | number;
  fillAlpha?: number;
  strokeWidth?: number;
  strokeColor?: string | number;
};

export type RectangleOptions = CircleOptions & {
  width?: number;
  height?: number;
};

type State = {
  app: React.MutableRefObject<Application | undefined>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  viewport: React.MutableRefObject<Viewport | null>;
  init: (canvas: HTMLCanvasElement) => void;
  activeTool: Tool;
  activateTool: (name: Tool) => void;
  setCanvasSize: (width: number, height: number) => void;
  drawBackground: () => void;

  // drawing functions:
  drawCircle: (options: CircleOptions) => void;

  text: {};
};

type Props = {
  children: React.ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);
/** @todo turn most of this hook into a class and return just one variable*/
const PaperStateProvider = ({ children }: Props) => {
  // important states:
  const app = useRef<Application>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  //
  const viewport = useRef<Viewport | null>(null);
  const items = useRef<Container | null>(null);
  // const freehand = useRef<Container | null>(null);

  // useful to generate certain things:
  const [cell_size, cellSize, setCellSize] = useUpdatedState(60);
  const prevActiveTool = useRef<Tool>(TOOL.SELECT);

  // useful states for handling events
  const [active_tool, activeTool, setActiveTool] = useUpdatedState<Tool>(
    TOOL.SELECT
  );

  const [text, setText] = useState({});

  // const selectedItems = useRef<paper.Group | null>(null);
  // const hitResult = useRef<paper.HitResult | null>(null);
  // const transformBoxes = useRef<paper.Layer | null>(null);

  const init = (canvasElement: HTMLCanvasElement) => {
    if (!containerRef.current) return;
    if (app.current) return;

    const box = containerRef.current.getBoundingClientRect();

    app.current = new Application({
      width: box.width,
      height: box.height,
      resolution: 1, // use 2 for hardware accelerated devices
      antialias: true,
      autoDensity: true,
      view: canvasElement,
      backgroundAlpha: 0,
    });

    if (app.current.renderer instanceof CanvasRenderer) console.log("CANVAS");
    if (app.current.renderer instanceof Renderer) console.log("WEBGL");

    // create viewport (all items will be here):
    const vp = new Viewport({
      interaction: app.current.renderer.plugins.interaction,
      passiveWheel: false,
      disableOnContextMenu: true,
    });
    vp.name = "viewport";
    vp.drag({
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
      .on("zoomed", () => drawBackground()) //    pixi-viewport event only
      .on("moved-end", () => drawBackground()) // pixi-viewport event only
      .on("pointerdown", (event: InteractionEvent) => {
        if (!app.current || !items.current) return;

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
        const interation = app.current.renderer.plugins
          .interaction as InteractionManager;
        const hit = interation.hitTest(event.data.global, items.current);

        if (hit) disablePanning();
      })
      .on("pointerup", (event: InteractionEvent) => {
        console.log("pointerup", active_tool.current);
        if (active_tool.current === TOOL.SELECT) enablePanning();
        else disablePanning();
      });

    // freehand listeners:

    let path = new Graphics();
    let dragging = false;
    let points: number[][] = [];
    let color = 0;

    const options: StrokeOptions = {
      size: 10,
      thinning: 0.8,
      smoothing: 0.01,

      streamline: 0.99,
      easing: (t) => t,
      start: {
        taper: 0,
        cap: true,
      },
      end: {
        taper: 0,
        cap: true,
      },
    };

    vp.on("pointerdown", (event: InteractionEvent) => {
      if (active_tool.current === TOOL.FREEHAND) {
        console.log("freehand OSDJFlksjldf");
        dragging = true;
        path = new Graphics();
        color = getRandomIntInclusive(0, 0xffffff);
        path.lineStyle({ width: 0 });
        items.current?.addChild(path);

        // const { x, y } = event.data.global;
        const { x, y } = vp.toWorld(event.data.global);

        // path.position.set(x, y);
        points.push([x, y]);
      }
    })
      .on("pointermove", (event: InteractionEvent) => {
        if (active_tool.current === TOOL.FREEHAND && dragging) {
          // console.log("pointermove");
          // const { x, y } = event.data.global;
          const { x, y } = vp.toWorld(event.data.global);
          points.push([x, y]);

          path.clear();
          path.beginFill(color, 1);
          const s = getStroke(points, options);
          const fs = s.flatMap((i) => i);
          path.drawPolygon(fs);
          path.endFill();
        }
      })
      .on("pointerup", () => {
        if (active_tool.current === TOOL.FREEHAND) {
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

          dragging = false;
          points = [];
        }
      });

    viewport.current = vp;

    // background container to generate our infinite background patterns:
    const background = new Container();
    background.name = "background";

    // container where we'll put all items that get join and are interactable
    const itemsContainer = new Container();
    itemsContainer.name = "items";
    items.current = itemsContainer;

    // prolly dont need this
    // const freehandSpace = new Container();
    // freehandSpace.name = "freehand";
    // freehand.current = freehandSpace;

    // freehandSpace.visible = false;

    // ADDING CHILD ORDER IS IMPORTANT:
    viewport.current.addChild(background);
    viewport.current.addChild(itemsContainer);
    // viewport.current.addChild(freehandSpace);
    app.current.stage.addChild(viewport.current);

    // const selectedItems = new Container();
    // selectedItems.name = "active";
    // app.current.stage.addChild(selectedItems);

    // initTools(freehandSpace);
  };

  const initTools = (freehandContainer: Container) => {
    if (!viewport.current) return;
    console.log("initTools:", freehandContainer);

    const vp = viewport.current;

    const { x, y, width, height } = vp.getVisibleBounds();

    const surface = new Graphics();
    surface.beginFill(0);
    surface.drawRect(0, 0, width, height);
    surface.endFill();
    surface.position.set(x, y);

    freehandContainer
      .on("click", (ie: InteractionEvent) => {
        console.log("> freehand:pointerdown");
      })
      .on("pointerdown", (ie: InteractionEvent) => {
        console.log("> freehand:pointerdown");
      });

    freehandContainer.zIndex = 5000;

    freehandContainer.addChild(surface);

    freehandContainer.zIndex = 6000;
    // freehandContainer.visible = false;
  };

  const activateFreehandMode = () => {
    if (!viewport.current) return;
    const vp = viewport.current;
    const bounds = vp.getVisibleBounds();
  };

  const drawFreehand = (points: number[][]) => {
    if (!app.current) return;
    if (!viewport.current) return;
    // getStroke()

    // let points: number[][] = [];
    const line = new Graphics();

    const color = getRandomIntInclusive(0, 0xffffff);

    line.position.set(500, 500);
    line.beginFill();
    line.lineStyle(1, color);
    line.moveTo(0, 0).lineTo(50, 50);

    line.endFill();

    // const items: Container = viewport.current.getChildByName("items");
    viewport.current.addChild(line);
  };

  const drawBackground = () => {
    if (!app.current) return;
    if (!viewport.current) return;

    const vp = viewport.current;
    const bgc: Container = vp.getChildByName("background");
    bgc.removeChildren();

    const cell = cell_size.current; // the gap between each cell of the grid
    const pattern = new Graphics();

    // measurements
    const vp_bounds = vp.getVisibleBounds();
    const gridbox = vp_bounds.pad(cell);
    const hboxes = Math.round(gridbox.width / cell);
    const vboxes = Math.round(gridbox.height / cell);

    // for circle:
    pattern.beginFill(clr(0xffffff), 1);
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
    bgc.addChild(pattern);
  };

  const deselectAll = () => {};

  const disablePanning = () => {
    // viewport.current?.drag({ pressDrag: false, mouseButtons: "all" });
    viewport.current?.drag({ pressDrag: true, mouseButtons: "middle" });
  };
  const enablePanning = () => {
    viewport.current?.drag({ pressDrag: true, mouseButtons: "all" });
  };

  const activateTool = (name: Tool) => {
    setActiveTool(name);
    if (name !== TOOL.SHAPE) prevActiveTool.current = name;
  };

  const drawCircle = (options: CircleOptions) => {
    if (!app.current) return;
    if (!viewport.current) return;
    const {
      x = 0,
      y = 0,
      radius = 5,
      color = 0xaabbcc,
      name,
      strokeColor = 0xaabbcc,
      strokeWidth = 0,
    } = options;

    const vp = viewport.current;

    const gfx = new Graphics();
    gfx.lineStyle({ color: clr(strokeColor), width: strokeWidth });
    gfx.beginFill(clr(color), 1);
    gfx.drawCircle(0, 0, radius);
    gfx.endFill();

    gfx.position.set(x, y);
    gfx.buttonMode = true;
    gfx.interactive = true;

    let dragging = false;
    let mousedowndata: InteractionData | null;
    let offset = { x: 0, y: 0 };

    const onDragStart = (event: InteractionEvent) => {
      if (!viewport.current) return;
      // disablePanning();

      dragging = true;
      gfx.alpha = 0.8;
      mousedowndata = event.data;

      const lp = event.data.getLocalPosition(gfx.parent);
      offset = { x: gfx.x - lp.x, y: gfx.y - lp.y };
    };

    const onDragEnd = (event: InteractionEvent) => {
      if (!viewport.current) return;
      // enablePanning();

      dragging = false;
      gfx.alpha = 1;
      mousedowndata = null;
    };

    const onDragMove = (event: InteractionEvent) => {
      if (dragging) {
        if (!mousedowndata) return;
        const new_pos = mousedowndata.getLocalPosition(gfx.parent);
        gfx.position.set(new_pos.x + offset.x, new_pos.y + offset.y);
      }
    };

    gfx
      .on("pointerdown", onDragStart)
      .on("pointerup", onDragEnd)
      .on("pointerupoutside", onDragEnd)
      .on("pointermove", onDragMove);

    items.current?.addChild(gfx);
  };

  const drawRectangle = (options: RectangleOptions) => {
    if (!app.current) return;
    if (!viewport.current) return;
    let {
      x = 0,
      y = 0,
      radius = 5,
      color,
      fillAlpha = 1,
      name,
      strokeColor = 0xaabbcc,
      strokeWidth = 0,
      width = 10,
      height = 10,
    } = options;

    const vp = viewport.current;
    // const world = vp.toWorld(x, y);
    const world = { x, y };
    const graphics = new Graphics();

    color = color ? clr(color) : undefined;
    fillAlpha = color ? fillAlpha : 0;
    graphics.beginFill(color, fillAlpha);
    graphics.lineStyle({ color: clr(strokeColor), width: strokeWidth });
    graphics.drawRect(world.x, world.y, width, height);
    graphics.endFill();

    vp.addChild(graphics);
  };

  const setCanvasSize = (width: number, height: number) => {
    if (!app.current) return;
    app.current.renderer.resize(width, height);
    app.current.view.style.width = `${width}px`;
    app.current.view.style.height = `${height}px`;

    if (!viewport.current) return;
    viewport.current.resize(width, height);
    drawBackground();
  };

  useEffect(() => {
    const test = (event: KeyboardEvent) => {
      if (event.key === "d") {
        console.log("--------------DEBUG------------------------");
        // console.log(app.current?.stage.children.length);
        // console.log(app.current?.stage.children.map((item) => item));
        // setCellSize((v) => v + 5);
        // drawFreehand();
        console.log("-------------END DEBUG----------------------");
      }
      if (event.key === "a") {
        if (!viewport.current) return;
        if (!app.current) return;
        const color = randomInt(0, 0xffffff);
        const bounds = viewport.current.getVisibleBounds();
        drawRectangle({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          strokeWidth: 2,
          strokeColor: color,
        });
      }
    };

    window.addEventListener("keydown", test);
    return () => {
      window.removeEventListener("keydown", test);
    };
  }, []);

  useEffect(() => {
    if (!viewport.current || !app.current) return;

    switch (activeTool) {
      case TOOL.SELECT:
        enablePanning();
        break;
      case TOOL.FREEHAND:
        console.log("freehand mode is activating");
        disablePanning();

        break;
      case TOOL.CIRCLE:
        break;
      case TOOL.RECTANGLE:
        break;

      default:
        enablePanning();
        break;
    }
  }, [activeTool]);

  useEffect(() => {
    console.log("Cell size changed to", cellSize);
    drawBackground();
  }, [cellSize]);

  useEffect(() => {
    console.log("!!!!! PaperContext re-rendering");
  });

  return (
    <PaperStateContext.Provider
      value={{
        text,
        app,
        containerRef,
        canvasRef,
        viewport,
        init,
        activeTool,
        activateTool,
        setCanvasSize,
        drawBackground,

        drawCircle,
      }}
    >
      {children}
    </PaperStateContext.Provider>
  );
};

const usePaperState = () => {
  const context = useContext(PaperStateContext);
  if (context === undefined)
    throw new Error(
      "usePaperState must be used within a PaperSpaceStateProvider"
    );
  return context;
};

export { PaperStateProvider, usePaperState };
