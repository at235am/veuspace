import { useTheme } from "@emotion/react";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

type State = {
  isMobile: boolean;
  sidebarState: boolean;
  setSidebarState: Dispatch<SetStateAction<boolean>>;

  // dropPosition: React.MutableRefObject<{
  //   x: number;
  //   y: number;
  // }>;
  // setDropPosition: (val: { x: number; y: number }) => void;
  dropPosition: {
    x: number;
    y: number;
  };
  setDropPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  toggleSidebar: () => void;
};

type UIProviderProps = {
  children: React.ReactNode;
};

const UIStateContext = createContext<State | undefined>(undefined);

const UIStateProvider = ({ children }: UIProviderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery({
    query: `(max-width: ${theme.breakpoints.s}px)`,
  });
  const [sidebarState, setSidebarState] = useState<boolean>(true);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const toggleSidebar = () => setSidebarState((val) => !val);

  // const scrollRef = useRef<HTMLElement>();

  return (
    <UIStateContext.Provider
      value={{
        isMobile,
        sidebarState,
        setSidebarState,
        toggleSidebar,
        dropPosition,
        setDropPosition,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};

const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined)
    throw new Error("useUIState must be used within a UIStateProvider");
  return context;
};

export { UIStateProvider, useUIState };
