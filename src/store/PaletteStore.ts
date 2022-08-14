import create from "zustand";
import { persist } from "zustand/middleware";
import {
  MappedPresetOptions,
  PresetOptions,
} from "../components/Toolbar/DrawPicker/DrawPicker.component";

import { LocalStorage } from "./_LocalStorageKeys";

const default_presets: MappedPresetOptions = {
  1: { id: "1", size: 3, color: "#2e8df9" },
  2: { id: "2", size: 6, color: "#c544b0" },
  3: { id: "3", size: 9, color: "#ecdf2e" },
  4: { id: "4", size: 12, color: "#ffffff" },
  5: { id: "5", size: 17, color: "#7050cc" },
  6: { id: "6", size: 18, color: "#414141" },
  7: { id: "7", size: 22, color: "#cb5151" },
  8: { id: "8", size: 25, color: "#3dc973" },
};

interface DrawerPresetState {
  presets: MappedPresetOptions;
  setPreset: (value: PresetOptions) => void;
}

export const useDrawPaletteStore = create<DrawerPresetState>()(
  persist(
    (set) => ({
      presets: default_presets,
      setPreset: (value: PresetOptions) => {
        set((state) => {
          const { presets } = state;
          //  const updatePreset = (value: PresetOptions) => {
          console.log(presets[value.id]);
          if (!presets[value.id]) return state;

          const copy = { ...presets };
          copy[value.id] = value;
          return { state, presets: copy };
          //  };
        });
      },
    }),
    { name: LocalStorage.DRAW_PALETTE, version: 0 }
  )
);
