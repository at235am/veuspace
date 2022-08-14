import { ReactNode, useEffect, useMemo, useState } from "react";

// styles:
import {
  Container,
  ToolbarContainer,
  ToolPropertiesContainer,
} from "./Toolbar.styles";

// icons:
import {
  IconPencil,
  IconRectangle,
  IconEraser,
  IconPhoto,
  IconPointer,
  IconLetterT,
  IconArrowTopCircle,
} from "@tabler/icons";

import { getRandomIntInclusive as randomInt } from "../../utils/utils";
import { TOOL, Tool } from "../../modules/PixiApplication";

// hooks:
import { useToolbarStore } from "../../store/ToolbarState";
import { useThemeController } from "../../styles/theme/Theme.context";
import { usePaperState } from "../../contexts/PaperContext";
import { useUserSettingStore } from "../../store/UserSettingStore";

// custom components:
import { ToolButton } from "./ToolButton";

// palette components:
import { DrawPicker } from "./DrawPalette";

const TabContent: Record<Tool, ReactNode> = {
  [TOOL.SELECT]: <> select </>,
  [TOOL.DRAW]: <DrawPicker />,
  [TOOL.ERASE]: <></>,
  [TOOL.FORM]: <> SHAPE </>,
  [TOOL.ARROW]: <> arrow </>,
  [TOOL.TEXT_ADD]: <> TEXT_ADD </>,
  [TOOL.TEXT_EDIT]: <> TEXT_EDIT </>,
  [TOOL.IMAGE]: <> IMAGE </>,
};

const iconSize = 22;
const iconStroke = 2;

const Toolbar = () => {
  const {
    pixim,
    mode: activeTool,
    setMode: setActiveTool,
    drawCircle,
  } = usePaperState();

  const { toggleBetweenLightAndDarkMode: toggleTheme } = useThemeController();

  const tabHandler = { activeTool, setActiveTool };

  // get keybind map:
  const keybinds = useUserSettingStore((state) => state.keybinds);
  const getKeybindsMap = useUserSettingStore((state) => state.getKeybindsMap);
  const keybindMap = useMemo(() => getKeybindsMap(), [keybinds]);

  const kbMap: Record<Tool, string> = {
    [TOOL.SELECT]: keybindMap["select"]?.keys[0] ?? "_",
    [TOOL.DRAW]: keybindMap["draw"]?.keys[0] ?? "_",
    [TOOL.ERASE]: keybindMap["erase"]?.keys[0] ?? "_",
    [TOOL.FORM]: keybindMap["form"]?.keys[0] ?? "_",
    [TOOL.ARROW]: keybindMap["arrow"]?.keys[0] ?? "_",
    [TOOL.TEXT_ADD]: keybindMap["text"]?.keys[0] ?? "_",
    [TOOL.TEXT_EDIT]: "",
    [TOOL.IMAGE]: "",
  };

  const drawRandomCircle = () => {
    const pixi = pixim.current;
    const { width, height } = pixi.app.screen;

    const p = pixi.viewport.toWorld(randomInt(0, width), randomInt(0, height));

    drawCircle({
      x: p.x,
      y: p.y,
      radius: randomInt(10, 50),
      color: randomInt(0, 0xffffff),
    });
  };

  return (
    <Container>
      <ToolbarContainer>
        <ToolButton
          {...tabHandler}
          id={TOOL.SELECT}
          keybind={kbMap[TOOL.SELECT]}
        >
          <IconPointer size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.DRAW} keybind={kbMap[TOOL.DRAW]}>
          <IconPencil size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.ERASE} keybind={kbMap[TOOL.ERASE]}>
          <IconEraser size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.FORM} keybind={kbMap[TOOL.FORM]}>
          <IconRectangle size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.ARROW} keybind={kbMap[TOOL.ARROW]}>
          <IconArrowTopCircle size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton
          {...tabHandler}
          id={TOOL.TEXT_ADD}
          keybind={kbMap[TOOL.TEXT_ADD]}
        >
          <IconLetterT size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton
          {...tabHandler}
          id={TOOL.IMAGE}
          keybind={kbMap[TOOL.IMAGE]}
          onClick={toggleTheme}
        >
          <IconPhoto size={iconSize} stroke={iconStroke} />
        </ToolButton>
      </ToolbarContainer>

      <ToolPropertiesContainer>
        {TabContent[activeTool]}
      </ToolPropertiesContainer>
    </Container>
  );
};

export default Toolbar;
