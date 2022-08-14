import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Tool } from "../../../modules/PixiApplication";
import { useToolbarStore } from "../../../store/ToolbarState";
import { useUserSettingStore } from "../../../store/UserSettingStore";
import { Container, Line, Button, KeybindLabel } from "./ToolButton.styles";

type Props = {
  id: Tool;
  activeTool: Tool;
  setActiveTool: Dispatch<SetStateAction<Tool>>;
  keybind: string;
  onClick?: () => void;
  children: React.ReactNode;
};

const ToolButton = ({
  id,
  activeTool,
  setActiveTool,

  keybind,
  onClick,
  children,
}: Props) => {
  const highlight = id === activeTool;
  const togglePalette = useToolbarStore((state) => state.toggle);
  const showHotkeys = useUserSettingStore((state) => state.showHotkeys);

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
      {showHotkeys && <KeybindLabel>{keybind}</KeybindLabel>}
      {highlight && <Line layoutId="line" />}
      <Button type="button" active={highlight} onClick={action}>
        {children}
      </Button>
    </Container>
  );
};

export default ToolButton;
