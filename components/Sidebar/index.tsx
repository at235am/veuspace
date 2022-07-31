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
import TabNavItem from "./TabNavItem";
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

// contexts:

// custom components:

// icons:

const Container = styled(motion.div)`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  height: 100%;

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  display: flex;
  flex-direction: row;
`;

const Header = styled.div`
  position: relative;
  width: 100%;

  padding: 0.5rem;

  background-color: #222;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const toolBarWidth = 50;

const ToolWrapper = styled.ul`
  min-width: ${toolBarWidth}px;
  max-width: ${toolBarWidth}px;
  padding: 2px;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Toolbar = styled.div`
  /* border: 1px solid red; */

  background-color: #303030;
  background-color: rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: column;
`;

const ActivityBar = styled.ul`
  /* border: 1px solid blue; */

  overflow: hidden;

  width: 18rem;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const ToggleBarButton = styled(motion.button)`
  background-color: transparent;
  border-radius: 50%;

  width: 2rem;
  height: 2rem;

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #333;
  }
`;

const TC = styled.div`
  background-color: #111;
  padding: 1rem;
`;

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
  const { app, zoom, activeTool, activateTool } = usePaperState();

  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const drawCircle = (options: CircleOptions) => {
    const {
      name = nanoid(),
      x = 0,
      y = 0,
      radius = 1,
      color = "#000000",
    } = options;

    const paper = app.current;
    const circle = new paper.Path.Circle(new paper.Point(x, y), radius);

    const s = new paper.Point(0, 0);
    // s.
    circle.name = name;
    circle.fillColor = paperColor(color);
  };

  const drawRandomCircle = () => {
    const paper = app.current;

    const p = paper.project.view.viewToProject(
      new paper.Point(
        randomInt(0, paper.view.viewSize.width),
        randomInt(0, paper.view.viewSize.height)
      )
    );

    // console.log(r);
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
              activateTool(TOOL.draw);
              drawRandomCircle();
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
              activateTool(TOOL.circle);
            }}
          >
            <IconCircle size={iconSize} stroke={iconStroke} />
          </TabNavItem>

          <TabNavItem
            {...tabHandler}
            id={TOOL.rectangle}
            onClick={() => {
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
