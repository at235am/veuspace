import create from "zustand";
import { persist } from "zustand/middleware";
import {
  MappedPresetOptions,
  DrawPresetOptions,
} from "../components/Toolbar/DrawPalette/DrawPalette.component";
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

const default_draw_presets: MappedPresetOptions = {
  1: { id: "1", size: 3, color: "#2e8df9" },
  2: { id: "2", size: 6, color: "#c544b0" },
  3: { id: "3", size: 9, color: "#ecdf2e" },
  4: { id: "4", size: 12, color: "#ffffff" },
  5: { id: "5", size: 17, color: "#7050cc" },
  6: { id: "6", size: 18, color: "#414141" },
  7: { id: "7", size: 22, color: "#cb5151" },
  8: { id: "8", size: 25, color: "#3dc973" },
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
  drawPresets: MappedPresetOptions;
  setDrawPresets: (value: DrawPresetOptions) => void;
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
    }),
    { name: LocalStorage.USER_SETTINGS, version: 0 }
  )
);
