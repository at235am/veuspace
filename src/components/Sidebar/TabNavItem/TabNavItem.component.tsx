import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Tool } from "../../../modules/PixiApplication";
import { Container, Line, Button } from "./TabNavItem.styles";

type Props = {
  id: Tool;
  children: React.ReactNode;
  activeTool: Tool;
  activeTab: Tool;
  setActiveTab: Dispatch<SetStateAction<Tool>>;
  onClick?: () => void;
};

const TabNavItem = ({
  id,
  children,
  activeTool,
  activeTab,
  setActiveTab,
  onClick,
}: Props) => {
  // const { mode, renderMode, toggleMode } = usePaperSpaceState();
  const highlight = id === activeTool || id === activeTab;

  const action = () => {
    setActiveTab(id);
    onClick && onClick();
  };

  return (
    <Container active={highlight}>
      {id === activeTab && <Line layoutId="line" />}
      <Button active={highlight} onClick={action}>
        {children}
      </Button>
    </Container>
  );
};

export default TabNavItem;
