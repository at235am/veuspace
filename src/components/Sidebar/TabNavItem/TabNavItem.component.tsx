import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Tool } from "../../../modules/PixiApplication";
import { Container, Line, Button } from "./TabNavItem.styles";

type Props = {
  id: Tool;
  activeTool: Tool;
  setActiveTool: Dispatch<SetStateAction<Tool>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;

  // activeTab: Tool;
  // setActiveTab: Dispatch<SetStateAction<Tool>>;
  onClick?: () => void;
  children: React.ReactNode;
};

const TabNavItem = ({
  id,
  activeTool,
  setActiveTool,
  setSidebarOpen,
  // activeTab,
  // setActiveTab,
  onClick,
  children,
}: Props) => {
  // const { mode, renderMode, toggleMode } = usePaperSpaceState();
  // const highlight = id === activeTool || id === activeTab;
  const highlight = id === activeTool;

  const toggleMore = (tool: Tool) => {
    if (tool === activeTool) setSidebarOpen((v) => !v);
  };

  const action = () => {
    setActiveTool(id);
    toggleMore(id);
    onClick && onClick();
  };

  return (
    <Container active={highlight}>
      {highlight && <Line layoutId="line" />}
      <Button active={highlight} onClick={action}>
        {children}
      </Button>
    </Container>
  );
};

export default TabNavItem;
