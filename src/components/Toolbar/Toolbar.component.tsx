// libary:
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";

// nextjs:
import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

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
} from "./Toolbar.styles";
import { Graphics, InteractionManager } from "pixi.js-legacy";
import { TOOL, Tool } from "../../modules/PixiApplication";
import { History } from "./History";
import { Zoomer } from "./Zoomer";

const Test = ({ text }: { text: string }) => {
  return <TC>{text}</TC>;
};

const TabContent: Record<Tool, ReactNode> = {
  [TOOL.SELECT]: <Test text="select" />,
  [TOOL.ERASE]: <></>,
  [TOOL.FREEHAND]: <Test text="draw" />,
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabHandler = { activeTool, setActiveTool, setSidebarOpen };

  const sidebarAnim = {
    variants: {
      open: {
        height: "auto",
      },
      close: {
        height: 0,
      },
    },
    initial: "close",
    animate: sidebarOpen ? "open" : "close",
    transition: { type: "tween", duration: 0.25 },
  };

  const toggleButtonAnim = {
    variants: {
      open: {
        rotate: 0,
      },
      close: {
        rotate: 180,
      },
    },
    initial: "close",
    animate: sidebarOpen ? "open" : "close",
    transition: { type: "tween", duration: 0.25 },
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

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
          <IconClick size={iconSize} stroke={iconStroke} />
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
          <IconTypography size={iconSize} stroke={iconStroke} />
        </ToolButton>

        <ToolButton {...tabHandler} id={TOOL.IMAGE}>
          <IconPhoto
            size={iconSize}
            stroke={iconStroke}
            onClick={drawRandomCircle}
          />
        </ToolButton>
      </ToolbarContainer>

      <ToolPropertiesContainer {...sidebarAnim}>
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={activeTool}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {TabContent[activeTool]}
          </motion.div>
        </AnimatePresence>
      </ToolPropertiesContainer>
    </Container>
  );
};

export default Toolbar;
