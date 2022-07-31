import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Container, Line, Button } from "./TabNavItem.styles";

type Props = {
  id: string;
  children: React.ReactNode;
  activeTool: string;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
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
      <Button onClick={action}>{children}</Button>
    </Container>
  );
};

export default TabNavItem;
