import { Logo } from "../Logo";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { ToolButton } from "./ToolButton";
import { usePaperState } from "../../contexts/PaperContext";
import { nanoid, random } from "nanoid";

import {
  IconPencil,
  IconClick,
  IconTypography,
  IconShape,
  IconShape2,
  IconShape3,
  IconRectangle,
  IconCircleRectangle,
  IconRotateRectangle,
  IconCircle,
  IconEraser,
  IconPhoto,
  IconPointer,
  IconTextResize,
  IconTextRecognition,
  IconBrush,
  IconBrushOff,
  IconLetterT,
} from "@tabler/icons";
import Color from "color";
import { getRandomIntInclusive as randomInt } from "../../utils/utils";
import {
  TC,
  Container,
  ToolbarContainer,
  Header,
  ToggleBarButton,
  ToolPropertiesContainer,
  FloatContainer,
} from "./Toolbar.styles";
import { TOOL, Tool } from "../../modules/PixiApplication";

import { DrawPicker } from "./DrawPicker/";
import { useToolbarStore } from "../../store/ToolbarState";
import { useThemeController } from "../../styles/theme/Theme.context";

const Test = ({ text }: { text: string }) => {
  return <TC>{text}</TC>;
};

const TabContent: Record<Tool, ReactNode> = {
  [TOOL.SELECT]: <Test text="select" />,
  [TOOL.ERASE]: <></>,
  [TOOL.FREEHAND]: <DrawPicker />,
  [TOOL.TEXT_ADD]: <Test text="text_add" />,
  [TOOL.SHAPE]: <Test text="SHAPE" />,
  [TOOL.CIRCLE]: <Test text="CIRCLE" />,
  [TOOL.RECTANGLE]: <Test text="RECTANGLE" />,
  [TOOL.TEXT_ADD]: <Test text="TEXT_ADD" />,
  [TOOL.TEXT_EDIT]: <Test text="TEXT_EDIT" />,
  [TOOL.IMAGE]: <Test text="IMAGE" />,
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
        <ToolButton {...tabHandler} id={TOOL.SELECT}>
          <IconPointer size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.FREEHAND}>
          <IconPencil size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.ERASE}>
          <IconEraser size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.CIRCLE}>
          <IconCircle size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.RECTANGLE}>
          <IconRectangle size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.TEXT_ADD}>
          <IconLetterT size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.IMAGE} onClick={toggleTheme}>
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
