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

  setHotkeyPaused: (value: boolean) => void;
  toggleHotkeyPaused: () => void;

  // drawing functions:
  drawCircle: (options: CircleOptions) => void;
};

type Props = {
  children: ReactNode;
};

const PaperStateContext = createContext<State | undefined>(undefined);

const PaperStateProvider = ({ children }: Props) => {
  const { toggleBetweenLightAndDarkMode: toggleTheme, selectedTheme } =
    useThemeController();
  const theme = useTheme();
  const pixim = useRef<PixiApplication>(PixiApplication.getInstance());

  // gui states:
  const [mode, setMode] = useState<Tool>(TOOL.SELECT);
  const [cellSize, setCellSize] = useState(60);

  // zustand / local storage states:
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
          pixim.current.grid = !pixim.current.grid;
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
          console.log("hello chaing theme");
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

  const setup = (canvas: HTMLCanvasElement, container: HTMLElement) => {
    pixim.current.setup(canvas, container);
  };

  const setModeProtected = (mode: Tool) => {
    if (pixim.current.activeTool.isUsing) return;
    setMode(mode);
  };

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

    const gfx = new Graphics();

    gfx.lineStyle({ color: ctn(strokeColor), width: strokeWidth });
    gfx.beginFill(ctn(color), 1);
    gfx.drawCircle(0, 0, radius);
    gfx.endFill();
    gfx.position.set(x, y);
    gfx.buttonMode = true;
    gfx.interactive = true;

    pixim.current.items.addChild(gfx);
  };

  useEffect(() => {
    pixim.current.cellSize = cellSize;
  }, [cellSize]);

  useEffect(() => {
    pixim.current.mode = mode;
  }, [mode]);

  useEffect(() => {
    pixim.current.backgroundPattern = { color: theme.colors.onSurface.B00 };
  }, [theme]);

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
        setHotkeyPaused,
        toggleHotkeyPaused,
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
