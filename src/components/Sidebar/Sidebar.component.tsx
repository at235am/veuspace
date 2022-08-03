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
import { TabNavItem } from "./TabNavItem";
import { usePaperState, TOOL, Tool } from "../../contexts/PaperContext";
import { nanoid, random } from "nanoid";

import {
  IconPencil,
  IconClick,
  IconNotebook,
  IconArrowsMove,
  IconShare,
  IconCursorText,
  IconHighlight,
  IconTypography,
  IconChevronLeft,
  IconMenu,
  IconShape,
  IconShape2,
  IconShape3,
  IconRectangle,
  IconCircleRectangle,
  IconRotateRectangle,
  IconPlus,
  IconMinus,
  IconBug,
  IconCircle,
} from "@tabler/icons";
import Color from "color";
import { getRandomIntInclusive as randomInt } from "../../utils/utils";
import {
  TC,
  toolBarWidth,
  Container,
  Toolbar,
  Header,
  ToggleBarButton,
  ToolWrapper,
  ActivityBar,
} from "./Sidebar.styles";
import { Graphics } from "pixi.js-legacy";

const Test = ({ text }: { text: string }) => {
  return <TC>{text}</TC>;
};

const TabContent: Record<Tool, ReactNode> = {
  [TOOL.SELECT]: <Test text="select" />,
  [TOOL.ERASE]: <Test text="draw" />,
  [TOOL.FREEHAND]: <Test text="draw" />,
  [TOOL.TEXT_ADD]: <Test text="text_add" />,
  [TOOL.SHAPE]: <Test text="SHAPE" />,
  [TOOL.CIRCLE]: <Test text="CIRCLE" />,
  [TOOL.RECTANGLE]: <Test text="RECTANGLE" />,
  [TOOL.TEXT_ADD]: <Test text="TEXT_ADD" />,
  [TOOL.TEXT_EDIT]: <Test text="TEXT_EDIT" />,
};

type CircleOptions = {
  name?: string;
  x?: number;
  y?: number;
  radius?: number;
  color?: string | number;
};

const iconSize = 22;
const iconStroke = 2;

const Sidebar = () => {
  // const { mode, renderMode, toggleMode, setBackground } = usePaperSpaceState();
  const { app, activeTool, activateTool, drawCircle, viewport } =
    usePaperState();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tool>(TOOL.SELECT);
  const tabHandler = { activeTab, setActiveTab, activeTool };

  const sidebarAnim = {
    variants: {
      open: {
        width: "auto",
      },
      close: {
        width: toolBarWidth,
      },
    },
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
    animate: sidebarOpen ? "open" : "close",
    transition: { type: "tween", duration: 0.25 },
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const zoom = (change: number) => {};

  const drawRandomCircle = () => {
    if (!app.current || !viewport.current) return;

    const { width, height } = app.current.screen;

    const p = viewport.current.toWorld(
      randomInt(0, width),
      randomInt(0, height)
    );
    drawCircle({
      x: p.x,
      y: p.y,
      radius: randomInt(10, 50),
      color: randomInt(0, 0xffffff),
    });
  };

  return (
    <Container {...sidebarAnim}>
      <Toolbar>
        <Header>
          <ToggleBarButton
            {...toggleButtonAnim}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <IconMenu size={16} />
          </ToggleBarButton>
        </Header>
        <ToolWrapper>
          <TabNavItem {...tabHandler} id={TOOL.TEXT_EDIT} onClick={openSidebar}>
            <IconNotebook size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.SELECT}
            // activeTool={activeTool === TOOL.SELECT.select}
            onClick={() => {
              console.log("select");
              activateTool(TOOL.SELECT);
            }}
          >
            <IconClick size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.FREEHAND}
            onClick={() => {
              console.log("freehand");
              activateTool(TOOL.FREEHAND);
            }}
          >
            <IconPencil size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.CIRCLE}
            onClick={() => {
              // drawRandomCircle();
              [...Array(50).keys()].forEach(() => drawRandomCircle());
              activateTool(TOOL.CIRCLE);
            }}
          >
            <IconCircle size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.RECTANGLE}
            onClick={() => {
              drawCircle({
                x: 500,
                y: 500,
                // x: (app.current?.screen.width ?? 0) / 2,
                // y: (app.current?.screen.height ?? 0) / 2,
                radius: randomInt(10, 50),
                color: randomInt(0, 0xffffff),
                strokeWidth: 2,
                strokeColor: 0xffffff,
              });

              activateTool(TOOL.RECTANGLE);
            }}
          >
            <IconRectangle size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.TEXT_ADD}
            onClick={() => {
              activateTool(TOOL.TEXT_ADD);
            }}
          >
            <IconTypography size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.TEXT_EDIT}
            onClick={() => zoom(-1)}
          >
            <IconPlus size={iconSize} stroke={iconStroke} />
          </TabNavItem>
          <TabNavItem
            {...tabHandler}
            id={TOOL.TEXT_EDIT}
            onClick={() => zoom(1)}
          >
            <IconMinus size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.TEXT_EDIT}
            onClick={() => {
              console.log("current tool", activeTool);
              activateTool(TOOL.SELECT);
            }}
          >
            <IconBug size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem {...tabHandler} id={TOOL.TEXT_EDIT} onClick={() => {}}>
            <IconShare size={iconSize} stroke={iconStroke} />
          </TabNavItem>
        </ToolWrapper>
      </Toolbar>

      <ActivityBar>
        <Header>
          <Logo />
        </Header>
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {TabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </ActivityBar>
    </Container>
  );
};

export default Sidebar;
