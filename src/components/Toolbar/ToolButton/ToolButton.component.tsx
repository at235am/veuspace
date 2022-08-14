import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Keybind } from "../../../hooks/useHotkeys";
import { Tool } from "../../../modules/PixiApplication";
import { useKeybindStore } from "../../../store/KeybindStore";
import { useToolbarStore } from "../../../store/ToolbarState";
import { Container, Line, Button, KeybindLabel } from "./ToolButton.styles";

type Props = {
  id: Tool;
  activeTool: Tool;
  setActiveTool: Dispatch<SetStateAction<Tool>>;

  onClick?: () => void;
  children: React.ReactNode;
};

const ToolButton = ({
  id,
  activeTool,
  setActiveTool,

  onClick,
  children,
}: Props) => {
  const highlight = id === activeTool;
  const togglePalette = useToolbarStore((state) => state.toggle);

  const keybinds = useKeybindStore((state) => state.keybinds);
  const getKeybindsMap = useKeybindStore((state) => state.getKeybindsMap);
  const keybindMap = useMemo(() => getKeybindsMap(), [keybinds]);

  const keybind = keybindMap[id];
  const key = keybind ? keybind.keys[0] : "\\";

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
      <KeybindLabel>{key}</KeybindLabel>
      {highlight && <Line layoutId="line" />}
      <Button type="button" active={highlight} onClick={action}>
        {children}
      </Button>
    </Container>
  );
};

export default ToolButton;
