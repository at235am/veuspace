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
import { usePaperState, TOOL, CustomTool } from "../../contexts/PaperContext";
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
import {
  getRandomIntInclusive as randomInt,
  paperColor,
} from "../../utils/utils";
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

const TabContent: { [id: string]: ReactNode } = {
  notespaces: <Test text="notespaces" />,
  select: <Test text="select" />,
  draw: <Test text="draw" />,
  pan: <Test text="pan" />,
  text_add: <Test text="text_add" />,
  share: <Test text="share" />,
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
  const [activeTab, setActiveTab] = useState("notebook");
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
          <TabNavItem {...tabHandler} id={TOOL.notebook} onClick={openSidebar}>
            <IconNotebook size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.select}
            // activeTool={activeTool === TOOL.select}
            onClick={() => {
              console.log("select");
              activateTool(TOOL.select);
            }}
          >
            <IconClick size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.draw}
            onClick={() => {
              console.log("draw");
              [...Array(50).keys()].forEach(() => drawRandomCircle());

              activateTool(TOOL.draw);
              // drawRandomCircle();
            }}
          >
            <IconPencil size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.pan}
            onClick={() => {
              activateTool(TOOL.pan);
            }}
          >
            <IconArrowsMove size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.circle}
            onClick={() => {
              drawRandomCircle();
              activateTool(TOOL.circle);
            }}
          >
            <IconCircle size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.rectangle}
            onClick={() => {
              console.log("rect");
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

              activateTool(TOOL.rectangle);
            }}
          >
            <IconRectangle size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.text_add}
            onClick={() => {
              activateTool(TOOL.text_add);
            }}
          >
            <IconTypography size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem {...tabHandler} id="zoom_in" onClick={() => zoom(-1)}>
            <IconPlus size={iconSize} stroke={iconStroke} />
          </TabNavItem>
          <TabNavItem {...tabHandler} id="zoom_out" onClick={() => zoom(1)}>
            <IconMinus size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id="TESTTESTTEST"
            onClick={() => {
              console.log("current tool", activeTool);
              activateTool(TOOL.select);
            }}
          >
            <IconBug size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem {...tabHandler} id="share" onClick={() => {}}>
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
