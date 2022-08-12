import create from "zustand";

interface ToolbarState {
  showPalette: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useToolbarStore = create<ToolbarState>()((set) => ({
  showPalette: false,
  open: () => set(() => ({ showPalette: true })),
  close: () => set(() => ({ showPalette: false })),
  toggle: () => set((state) => ({ showPalette: !state.showPalette })),
}));
