import create from "zustand";
import { persist } from "zustand/middleware";
import { Keybind } from "../hooks/useHotkeys";

export const KEY_ACTION = {
  SELECT: "select",
  DRAW: "draw",
  ERASE: "erase",
  FORM: "form",
  ARROW: "arrow",
  TEXT: "text",
  PASTE_IMAGE: "paste-image",
  TOGGLE_GRID: "toggle-grid",
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
];

interface KeybindState {
  keybinds: Keybind[];
  updateKeybind: (kb: Keybind) => void;
  removeKeybind: (kb: Keybind) => void;
}

export const useKeybindStore = create<KeybindState>()(
  persist(
    (set) => ({
      keybinds: default_keybinds,

      updateKeybind: (kb: Keybind) => {
        set((state) => {
          const { keybinds } = state;

          const index = keybinds.findIndex((keybind) => keybind.id === kb.id);
          if (index === -1) return state;

          return {
            ...state,
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
            ...state,
            keybinds: [
              ...keybinds.slice(0, index),
              ...keybinds.slice(index + 1),
            ],
          };
        });
      },
    }),
    { name: "zus-keybind", version: 0 }
  )
);
