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
  useMemo,
} from "react";

import { colorToNumber as ctn } from "../utils/utils";
import { getRandomIntInclusive as randomInt } from "../utils/utils";

import { Graphics } from "pixi.js-legacy";

import { PixiApplication, TOOL, Tool } from "../modules/PixiApplication";

import { useThemeController } from "../styles/theme/Theme.context";
import { useHotkeys } from "../hooks/useHotkeys";
import { KEY_ACTION, useUserSettingStore } from "../store/UserSettingStore";
import { useTheme } from "@emotion/react";
import { usePaperStore } from "../store/PaperStore";

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
  // pixim: MutableRefObject<PixiApplication>;
  // pixim: MutableRefObject<PixiApplication | null>;

  // gui states:
  mode: Tool;
  cellSize: number;
  setMode: Dispatch<SetStateAction<Tool>>;
  setCellSize: Dispatch<SetStateAction<number>>;

  drawBackground: (
    ctx: CanvasRenderingContext2D,
    stageTransform: {
      x: number;
      y: number;
      scale: number;
    },
    dpr: number
  ) => void;

  setHotkeyPaused: (value: boolean) => void;
  toggleHotkeyPaused: () => void;

  loadFromStorage: () => void;
  switchToPaper: (id: string) => void;
};

type Props = {
  children: ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);

const PaperStateProvider = ({ children }: Props) => {
  const { toggleBetweenLightAndDarkMode: toggleTheme, selectedTheme } =
    useThemeController();
  const theme = useTheme();

  // const pixim = useRef<PixiApplication | null>(null);
  // const pixim = useRef<PixiApplication>(
  //   useMemo(() => new PixiApplication(), [])
  // );

  // gui states:
  const [mode, setMode] = useState<Tool>(TOOL.SELECT);
  const [cellSize, setCellSize] = useState(50);

  // zustand / local storage states:
  const activePaper = usePaperStore((state) => state.activePaper);
  const activatePaper = usePaperStore((state) => state.activatePaper);
  const toggleHotkeys = useUserSettingStore((state) => state.toggleHotkeys);
  const keybinds = useUserSettingStore((state) => state.keybinds);
  const keyActions = useMemo(
    () => [
      {
        actionId: KEY_ACTION.SELECT,
        action: () => {
          setModeProtected(TOOL.SELECT);
        },
      },
      {
        actionId: KEY_ACTION.DRAW,
        action: () => {
          setModeProtected(TOOL.DRAW);
        },
      },
      {
        actionId: KEY_ACTION.ERASE,
        action: () => {
          setModeProtected(TOOL.ERASE);
        },
      },
      {
        actionId: KEY_ACTION.FORM,
        action: () => {
          setModeProtected(TOOL.FORM);
        },
      },
      {
        actionId: KEY_ACTION.ARROW,
        action: () => {
          setModeProtected(TOOL.ARROW);
        },
      },
      {
        actionId: KEY_ACTION.TEXT,
        action: () => {
          setModeProtected(TOOL.TEXT_ADD);
        },
      },
      {
        actionId: KEY_ACTION.TOGGLE_GRID,
        action: () => {
          // pixim.current?.background.grid = !pixim.current.background.grid;
          // pixim.current?.background.setGrid(!pixim.current?.background.grid);
        },
      },
      {
        actionId: KEY_ACTION.TOGGLE_HOTKEYS,
        action: () => {
          toggleHotkeys();
        },
      },
      {
        actionId: KEY_ACTION.THEME_TOGGLE,
        action: () => {
          toggleTheme();
        },
      },
    ],
    []
  );

  const { setHotkeyPaused, toggleHotkeyPaused } = useHotkeys(
    keybinds,
    keyActions
  );

  const patternCanvas = useRef<HTMLCanvasElement | null>(null);

  const loadFromStorage = () => {
    // pixim.current?.items.removeChildren();
    // pixim.current?.loadObjects(activePaper.items);
  };

  const setModeProtected = (mode: Tool) => {
    // if (pixim.current?.activeTool.isUsing) return;
    setMode(mode);
  };

  const switchToPaper = (id: string) => {
    // const paper = activatePaper(id);
    // if (!paper) return;
    // pixim.current?.items.removeChildren();
    // pixim.current?.loadObjects(paper.items);
  };

  const drawPattern = (cellSize: number, scale: number) => {
    if (!patternCanvas.current) return;
    const ctx = patternCanvas.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.canvas.width = cellSize;
    ctx.canvas.height = cellSize;

    ctx.fillStyle = "#ffffff";

    // ctx.beginPath();
    // ctx.arc(0, 0, 1, 0, 2 * Math.PI);

    // const size = Math.max(1, Math.round(1 / scale));
    const size = scale > 1 ? 1 : Math.ceil(1 / scale);
    // const size = 1;

    ctx.rect(0, 0, size, size);
    // ctx.closePath();
    ctx.fill();
  };

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    stageTransform: { x: number; y: number; scale: number },
    dpr: number
  ) => {
    if (!patternCanvas.current) return;
    // patternCanvas.

    const { width, height } = ctx.canvas.getBoundingClientRect();
    const { scale, x: ox, y: oy } = stageTransform;

    drawPattern(cellSize, scale);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

    const pattern = ctx.createPattern(patternCanvas.current, "repeat");

    ctx.imageSmoothingEnabled = scale < 1;
    // ctx.imageSmoothingEnabled = false;

    if (!pattern) return;
    ctx.fillStyle = pattern;

    ctx.fillRect(
      Math.round(-ox / scale),
      Math.round(-oy / scale),
      Math.round(ctx.canvas.width / scale),
      Math.round(ctx.canvas.height / scale)
    );
  };

  useEffect(() => {
    patternCanvas.current = document.createElement("canvas");
  }, []);

  useEffect(() => {
    drawPattern(cellSize, 1);
    // pixim.current?.background.cellSize = cellSize;
    // pixim.current?.background.setCellSize(cellSize);
  }, [cellSize]);

  useEffect(() => {
    // pixim.current.mode = mode;
    // pixim.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    // pixim.current?.background.setPatternsColors([
    //   { type: "dot", color: theme.colors.onSurface.D10 },
    //   { type: "grid", color: theme.colors.onSurface.D20 },
    // ]);
  }, [theme]);

  return (
    <PaperStateContext.Provider
      value={{
        // pixim,
        mode,
        setMode,
        cellSize,
        setCellSize,

        drawBackground,
        setHotkeyPaused,
        toggleHotkeyPaused,
        loadFromStorage,
        switchToPaper,
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
