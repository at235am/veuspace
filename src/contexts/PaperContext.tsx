import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useEffect,
  useState,
  MutableRefObject,
  ReactNode,
} from "react";

import { colorToNumber as ctn } from "../utils/utils";
import { getRandomIntInclusive as randomInt } from "../utils/utils";

import { Graphics, InteractionData, InteractionEvent } from "pixi.js-legacy";

import { PixiApplication, TOOL, Tool } from "../modules/PixiApplication";

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
  // main states:
  pixim: MutableRefObject<PixiApplication>;
  setup: (canvas: HTMLCanvasElement, container: HTMLElement) => void;

  // gui states:
  mode: Tool;
  cellSize: number;
  setMode: Dispatch<SetStateAction<Tool>>;
  setCellSize: Dispatch<SetStateAction<number>>;

  // drawing functions:
  drawCircle: (options: CircleOptions) => void;

  text: {};
};

type Props = {
  children: ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);
/** @todo turn most of this hook into a class and return just one variable*/
const PaperStateProvider = ({ children }: Props) => {
  // pixim = pixi manager
  const pixim = useRef<PixiApplication>(new PixiApplication());

  // gui states:
  const [mode, setMode] = useState<Tool>(TOOL.SELECT);
  const [cellSize, setCellSize] = useState(60);
  const [text, setText] = useState({});

  const setup = (canvas: HTMLCanvasElement, container: HTMLElement) => {
    pixim.current?.destroy();
    pixim.current = new PixiApplication(canvas, container);
  };

  const deselectAll = () => {};
  const disablePanning = () => {};
  const enablePanning = () => {};

  const drawCircle = (options: CircleOptions) => {
    const {
      x = 0,
      y = 0,
      radius = 5,
      color = 0xaabbcc,
      name,
      strokeColor = 0xaabbcc,
      strokeWidth = 0,
    } = options;
    const pixi = pixim.current;
    const viewport = pixi.viewport;
    const gfx = new Graphics();
    gfx.lineStyle({ color: ctn(strokeColor), width: strokeWidth });
    gfx.beginFill(ctn(color), 1);
    gfx.drawCircle(0, 0, radius);
    gfx.endFill();
    gfx.position.set(x, y);
    gfx.buttonMode = true;
    gfx.interactive = true;
    let dragging = false;
    let mousedowndata: InteractionData | null;
    let offset = { x: 0, y: 0 };
    const onDragStart = (event: InteractionEvent) => {
      dragging = true;
      gfx.alpha = 0.8;
      mousedowndata = event.data;
      const lp = event.data.getLocalPosition(gfx.parent);
      offset = { x: gfx.x - lp.x, y: gfx.y - lp.y };
    };
    const onDragEnd = (event: InteractionEvent) => {
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

    pixi.items.addChild(gfx);
  };

  const drawRectangle = (options: RectangleOptions) => {};

  useEffect(() => {
    const test = (event: KeyboardEvent) => {
      if (event.key === "d") {
        console.log("--------------DEBUG------------------------");
        console.log(">> FPS:", pixim.current?.app.ticker.FPS);
        console.log("-------------END DEBUG----------------------");
      }
      if (event.key === "r") {
        const color = randomInt(0, 0xffffff);
        const bounds = pixim.current.viewport.getVisibleBounds();
        drawRectangle({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          strokeWidth: 2,
          strokeColor: color,
        });
      }
      if (event.key === "c") pixim.current.items.removeChildren();
      if (event.key === "f") setCellSize((v) => v + 10);
      if (event.key === "a")
        console.log(">> ITEMS:", pixim.current.items.children.length);
    };
    window.addEventListener("keydown", test);
    return () => {
      window.removeEventListener("keydown", test);
    };
  }, []);

  useEffect(() => {
    const pixi = pixim.current;
    console.log("--------------------------------");
    console.log("PIXI APP:", pixi.id);

    return () => {
      console.log("DESTROYING", pixi.id);
      pixi.destroy();
    };
  }, []);

  useEffect(() => {
    pixim.current.cellSize = cellSize;
  }, [cellSize]);

  useEffect(() => {
    pixim.current.mode = mode;
  }, [mode]);

  return (
    <PaperStateContext.Provider
      value={{
        pixim,
        setup,
        mode,
        setMode,
        cellSize,
        setCellSize,
        drawCircle,
        text,
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
