import create from "zustand";
import { persist } from "zustand/middleware";
import {
  DrawPresetMap,
  DrawPresetOptions,
} from "../components/Toolbar/DrawPalette/DrawPalette.component";
import {
  FormShapePresetMap,
  FormShapePresetOptions,
} from "../components/Toolbar/ShapePalette/FormShapePalette.component";
import { Keybind } from "../hooks/useHotkeys";
import { LocalStorage } from "./_LocalStorageKeys";

export const KEY_ACTION = {
  SELECT: "select",
  DRAW: "draw",
  ERASE: "erase",
  FORM: "form",
  ARROW: "arrow",
  TEXT: "text",
  PASTE_IMAGE: "paste-image",
  TOGGLE_GRID: "toggle-grid",
  TOGGLE_HOTKEYS: "toggle-hotkeys",
  THEME_TOGGLE: "theme-toggle",
} as const;

const default_keybinds: Keybind[] = [
  {
    id: "select",
    description: "",
    keys: ["s"],
    actionId: KEY_ACTION.SELECT,
  },
  {
    id: "draw",
    description: "",
    keys: ["d"],
    actionId: KEY_ACTION.DRAW,
  },
  {
    id: "erase",
    description: "",
    keys: ["e"],
    actionId: KEY_ACTION.ERASE,
  },
  {
    id: "form",
    description: "",
    keys: ["f"],
    actionId: KEY_ACTION.FORM,
  },
  {
    id: "arrow",
    description: "",
    keys: ["a"],
    actionId: KEY_ACTION.ARROW,
  },
  {
    id: "text",
    description: "",
    keys: ["t"],
    actionId: KEY_ACTION.TEXT,
  },
  {
    id: "grid",
    description: "",
    keys: ["g"],
    actionId: KEY_ACTION.TOGGLE_GRID,
  },
  {
    id: "hotkeys",
    description: "",
    keys: ["h"],
    actionId: KEY_ACTION.TOGGLE_HOTKEYS,
  },
  {
    id: "theme-toggle",
    description: "",
    keys: ["p"],
    actionId: KEY_ACTION.THEME_TOGGLE,
  },
];

const default_draw_presets: DrawPresetMap = {
  1: { id: "1", size: 3, color: "#2e8df9" },
  2: { id: "2", size: 6, color: "#c544b0" },
  3: { id: "3", size: 9, color: "#ecdf2e" },
  4: { id: "4", size: 12, color: "#ffffff" },
  5: { id: "5", size: 17, color: "#7050cc" },
  6: { id: "6", size: 18, color: "#414141" },
  7: { id: "7", size: 22, color: "#cb5151" },
  8: { id: "8", size: 25, color: "#3dc973" },
};

const default_form_presets: FormShapePresetMap = {
  1: {
    id: "1",
    shape: "rectangle",
    radius: 0,
    fillColor: "#2e8df9",
    fillAlpha: 1,
    strokeColor: 0,
    strokeSize: 0,
  },
  2: {
    id: "2",
    shape: "rectangle",
    radius: 3,
    fillColor: "#c544b0",
    fillAlpha: 1,
    strokeColor: "#000000",
    strokeSize: 2,
  },
  3: {
    id: "3",
    shape: "rectangle",
    radius: 8,
    fillColor: "#ecdf2e",
    fillAlpha: 1,
    strokeColor: "#000000",
    strokeSize: 0,
  },
  4: {
    id: "4",
    shape: "rectangle",
    radius: 10,
    fillColor: "#7050cc",
    fillAlpha: 1,
    strokeColor: "#ffff00",
    strokeSize: 10,
  },

  5: {
    id: "5",
    shape: "rectangle",
    radius: 6,
    fillColor: "#7050cc",
    fillAlpha: 0,
    strokeColor: "#00fff0",
    strokeSize: 3,
  },
  6: {
    id: "6",
    shape: "rectangle",
    radius: 6,
    fillColor: "#7050cc",
    fillAlpha: 1,
    strokeColor: "#00fff0",
    strokeSize: 3,
  },
  7: {
    id: "7",
    shape: "rectangle",
    radius: 6,
    fillColor: "#cb5151",
    fillAlpha: 1,
    strokeColor: "#00fff0",
    strokeSize: 3,
  },
  8: {
    id: "8",
    shape: "rectangle",
    radius: 6,
    fillColor: "#3dc973",
    fillAlpha: 0.5,
    strokeColor: "#3dc973",
    strokeSize: 15,
  },
};

type KeybindMap = { [id: string]: Keybind };

interface UserSettingState {
  // TOOLBAR STATE:
  showHotkeys: boolean;
  autoClosePresets: boolean;
  autoCloseEditor: boolean;
  toggleHotkeys: () => void;
  toggleAutoClosePresets: () => void;
  toggleAutoCloseEditor: () => void;

  // KEYBINDS:
  keybinds: Keybind[];
  getKeybindsMap: () => KeybindMap;
  updateKeybind: (kb: Keybind) => void;
  removeKeybind: (kb: Keybind) => void;

  // DRAW PALETTE:
  drawPresets: DrawPresetMap;
  setDrawPresets: (value: DrawPresetOptions) => void;

  // DRAW PALETTE:
  formShapePresets: FormShapePresetMap;
  setFormShapePresets: (value: FormShapePresetOptions) => void;
}

export const useUserSettingStore = create<UserSettingState>()(
  persist(
    (set, get) => ({
      // TOOLBAR STATE --------------------------------------------------------
      showHotkeys: false,
      autoClosePresets: false,
      autoCloseEditor: true,

      toggleHotkeys: () =>
        set((state) => ({ showHotkeys: !state.showHotkeys })),
      toggleAutoClosePresets: () =>
        set((state) => ({ autoClosePresets: !state.autoClosePresets })),
      toggleAutoCloseEditor: () =>
        set((state) => ({ autoCloseEditor: !state.autoCloseEditor })),

      // KEYBINDS -------------------------------------------------------------
      keybinds: default_keybinds,
      getKeybindsMap: () => {
        const { keybinds } = get();
        const map: KeybindMap = {};
        keybinds.forEach((keybind) => {
          map[keybind.id] = keybind;
        });
        return map;
      },

      updateKeybind: (kb: Keybind) => {
        set((state) => {
          const { keybinds } = state;

          const index = keybinds.findIndex((keybind) => keybind.id === kb.id);
          if (index === -1) return state;

          return {
            keybinds: [
              ...keybinds.slice(0, index),
              kb,
              ...keybinds.slice(index + 1),
            ],
          };
        });
      },

      removeKeybind: (kb: Keybind) => {
        set((state) => {
          const { keybinds } = state;

          const index = keybinds.findIndex((keybind) => keybind.id === kb.id);
          if (index === -1) return state;

          return {
            keybinds: [
              ...keybinds.slice(0, index),
              ...keybinds.slice(index + 1),
            ],
          };
        });
      },

      // DRAW PALETTE -------------------------------------------------------------
      drawPresets: default_draw_presets,

      setDrawPresets: (value: DrawPresetOptions) => {
        set((state) => {
          const { drawPresets } = state;

          if (!drawPresets[value.id]) return state;

          const copy = { ...drawPresets };
          copy[value.id] = value;
          return { drawPresets: copy };
        });
      },

      // DRAW PALETTE -------------------------------------------------------------
      formShapePresets: default_form_presets,

      setFormShapePresets: (value: FormShapePresetOptions) => {
        set((state) => {
          const { formShapePresets } = state;

          if (!formShapePresets[value.id]) return state;

          const copy = { ...formShapePresets };
          copy[value.id] = value;
          return { formShapePresets: copy };
        });
      },
    }),
    { name: LocalStorage.USER_SETTINGS, version: 0 }
  )
);
