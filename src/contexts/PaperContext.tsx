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
import { colorToNumber as clr } from "../utils/utils";

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
  Rectangle,
  Renderer,
} from "pixi.js-legacy";

// utils:
import { clamp, roundIntToNearestMultiple } from "../utils/utils";

import useUpdatedState from "../hooks/useUpdatedState";

export type Tools =
  | "notebook"
  | "select"
  | "temp_select"
  | "draw"
  | "pan"
  | "temp_pan"
  | "circle"
  | "rectangle"
  | "text_add"
  | "text_edit"
  | "reset"
  | "eraser";

export const TOOL: Record<Tools, Tools> = {
  notebook: "notebook",
  select: "select",
  temp_select: "temp_select",
  draw: "draw",
  pan: "pan",
  temp_pan: "temp_pan",
  circle: "circle",
  rectangle: "rectangle",
  text_add: "text_add",
  text_edit: "text_edit",
  reset: "reset",
  eraser: "eraser",
};

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
  activeTool: Tools;
  activateTool: (name: Tools) => void;
  setCanvasSize: (width: number, height: number) => void;
  drawBackground: () => void;

  // drawing functions:
  drawCircle: (options: CircleOptions) => void;
};

type Props = {
  children: React.ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);

const PaperStateProvider = ({ children }: Props) => {
  // important states:
  const app = useRef<Application>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewport = useRef<Viewport | null>(null);

  // useful to generate certain things:
  const [cell_size, cellSize, setCellSize] = useUpdatedState(60);
  const prevActiveTool = useRef<Tools>(TOOL.select);

  // useful states for handling events
  const [activeTool, setActiveTool] = useState<Tools>(TOOL.select);

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
    vp.name = "items";
    vp.drag({
      mouseButtons: "all", // can specify combos of "left" | "right" | "middle" clicks
    })
      .wheel({
        wheelZoom: true, // zooms with mouse wheel
        center: null, // makes it zoom on pointer
      })

      .clampZoom({
        minScale: 0.4, // minimum scale
        maxScale: 10, // minimum scale
      })
      .pinch({ noDrag: false })
      .on("zoomed", () => drawBackground())
      .on("moved-end", () => drawBackground());

    viewport.current = vp;

    // add a background container to generate our infinite background patterns:
    const background = new Container();
    background.name = "background";
    viewport.current.addChild(background);

    // add the viewport to the application:
    app.current.stage.addChild(viewport.current);

    // const selectedItems = new Container();
    // selectedItems.name = "active";
    // app.current.stage.addChild(selectedItems);
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
    viewport.current?.drag({ pressDrag: false });
  };
  const enablePanning = () => {
    viewport.current?.drag({ pressDrag: true });
  };

  const activateTool = (name: Tools) => {
    setActiveTool(name);
    if (name !== TOOL.temp_select) prevActiveTool.current = name;
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
      // viewport.current.pause = true;
      disablePanning();

      dragging = true;
      gfx.alpha = 0.8;
      mousedowndata = event.data;

      const lp = event.data.getLocalPosition(gfx.parent);
      offset = { x: gfx.x - lp.x, y: gfx.y - lp.y };
    };

    const onDragEnd = (event: InteractionEvent) => {
      if (!viewport.current) return;
      // viewport.current.pause = false;
      enablePanning();

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

    vp.addChild(gfx);
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

  const initTools = () => {};

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
        setCellSize((v) => v + 5);
        console.log("-------------END DEBUG----------------------");
      }
      if (event.key === "a") {
        if (!viewport.current) return;
        if (!app.current) return;
        const color = randomInt(0, 0xffffff);

        const bounds = viewport.current.getVisibleBounds();
        console.log(bounds);
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
    console.log("cell size changed to", cellSize);
    drawBackground();
  }, [cellSize]);

  useEffect(() => {
    console.log("!!!!! PaperContext re-rendering");
  });

  return (
    <PaperStateContext.Provider
      value={{
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
