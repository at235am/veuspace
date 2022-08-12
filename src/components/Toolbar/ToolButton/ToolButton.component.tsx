import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Tool } from "../../../modules/PixiApplication";
import { useToolbarStore } from "../../../store/ToolbarState";
import { Container, Line, Button } from "./ToolButton.styles";

type Props = {
  id: Tool;
  activeTool: Tool;
  setActiveTool: Dispatch<SetStateAction<Tool>>;
  // setSidebarOpen: Dispatch<SetStateAction<boolean>>;

  onClick?: () => void;
  children: React.ReactNode;
};

const ToolButton = ({
  id,
  activeTool,
  setActiveTool,
  // setSidebarOpen,
  onClick,
  children,
}: Props) => {
  const highlight = id === activeTool;
  const togglePalette = useToolbarStore((state) => state.toggle);

  const toggleMore = (tool: Tool) => {
    if (tool === activeTool) togglePalette();
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

export default ToolButton;
