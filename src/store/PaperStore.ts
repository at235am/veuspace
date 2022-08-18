import create from "zustand";
import { persist } from "zustand/middleware";
import { ItemProps } from "../modules/items/BaseItem";
import { LocalStorage } from "./_LocalStorageKeys";
import { nanoid } from "nanoid";

type Paper = {
  id: string;
  name: string;
  items: ItemMap;
};

type PaperMap = { [id: string]: Paper };
type ItemMap = { [id: string]: ItemProps };

interface PaperState {
  papers: PaperMap;
  createNewPaper: (name?: string) => Paper;
  setPaper: (...paper: Paper[]) => void;
  removePaper: (...paper: Paper[]) => void;
  activatePaper: (paperId: string) => Paper | null;

  activePaper: Paper;
  setItem: (...itemsToSet: ItemProps[]) => void; // use this to add or update an item
  removeItem: (...itemsToDelete: ItemProps[]) => void; // use this to remove an item
}

const default_paper: Paper = { id: nanoid(), name: "", items: {} };

export const usePaperStore = create<PaperState>()(
  persist(
    (set, get) => ({
      papers: { [default_paper.id]: default_paper },

      createNewPaper: (name?: string) => {
        let newPaper: Paper = {
          id: nanoid(),
          name: name || "Untitled",
          items: {},
        };
        set((state) => {
          const papers = { ...state.papers, [newPaper.id]: newPaper };
          return { papers };
        });

        return newPaper;
      },

      setPaper: (...paper: Paper[]) => {
        set((state) => {
          const newPapers = { ...state.papers };

          paper.forEach((p) => {
            newPapers[p.id] = p;
          });

          return { papers: newPapers };
        });
      },

      removePaper: (...paper: Paper[]) => {
        set((state) => {
          const newPapers = { ...state.papers };

          paper.forEach((p) => {
            delete newPapers[p.id];
          });

          return { papers: newPapers };
        });
      },

      activatePaper: (paperId: string) => {
        let activePaper: Paper | null = null;
        set((state) => {
          // save the state of the current activePaper to all of the papers:
          const currentActivePaper = state.activePaper;
          state.setPaper(currentActivePaper);

          // switch to the paper with paperId
          activePaper = state.papers[paperId];
          return { activePaper: activePaper ?? state.activePaper };
        });

        return activePaper;
      },

      activePaper: default_paper,

      setItem: (...itemsToSet: ItemProps[]) => {
        set((state) => {
          if (!state.activePaper) return state;

          const { items, ...rest } = state.activePaper;
          const newItems = { ...items };

          itemsToSet.forEach((item) => {
            newItems[item.id] = item;
          });

          return { activePaper: { ...rest, items: newItems } };
        });
      },

      removeItem: (...itemsToDelete: ItemProps[]) => {
        set((state) => {
          if (!state.activePaper) return state;

          const { items, ...rest } = state.activePaper;
          const newItems = { ...items };

          itemsToDelete.forEach((item) => {
            delete newItems[item.id];
          });

          return { activePaper: { ...rest, items: newItems } };
        });
      },
    }),
    { name: LocalStorage.PAPER, version: 0 }
  )
);
