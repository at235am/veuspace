// libary:
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";

// nextjs:
import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  CanvasMode,
  MODES,
  usePaperSpaceState,
} from "../../contexts/PaperSpaceContext";

import {
  MdOutlineTextFields,
  MdDraw,
  MdKeyboardArrowLeft,
  MdShare,
  MdLockOpen,
} from "react-icons/md";
import { GiPlayButton } from "react-icons/gi";
import { RiDragMoveLine } from "react-icons/ri";
import { TbNotebook } from "react-icons/tb";
import Logo from "../Logo";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import TabNavItem from "./TabNavItem";

// contexts:

// custom components:

// icons:

const Container = styled(motion.div)`
  overflow: hidden;
  border-radius: 10px;
  height: 100%;

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);

  display: flex;
  flex-direction: row;
`;

const Header = styled.li`
  position: relative;
  width: 100%;

  padding: 0.5rem;

  background-color: #222;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Toolbar = styled.ul`
  /* border: 1px solid red; */

  background-color: #303030;
  background-color: rgba(0, 0, 0, 0.15);

  min-width: 3.5rem;
  height: 100%;

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

const CursorRotate = styled.span`
  transform: rotate(-120deg);
  svg {
    width: 20px;
    width: 20px;
  }
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

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CircleCenter = styled.div`
  /* position: relative; */
  z-index: 10;
  position: absolute;

  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ToolCircle = styled(motion.span)`
  /* position: absolute; */
  /* z-index: 10; */
  /* z-index: -2; */

  /* top: 0; */
  /* left: 0; */
  /* margin: 10px; */

  height: 5px;
  width: 5px;
  height: 2rem;
  width: 2rem;

  border-radius: 8px;

  border: 2px solid ${({ theme }) => theme.colors.primary.main};

  background-color: ${({ theme }) => theme.colors.primary.main};
  background-color: #222;
  background-color: transparent;
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

const ToolMarker = () => {};

const Sidebar = () => {
  const { mode, renderMode, toggleMode, setBackground } = usePaperSpaceState();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("notespaces");

  const tabHandler = { activeTab, setActiveTab };

  const sidebarAnim = {
    variants: {
      open: {
        width: "auto",
      },
      close: {
        width: "3.5rem",
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

  return (
    <Container {...sidebarAnim}>
      <Toolbar>
        <Header>
          <ToggleBarButton
            {...toggleButtonAnim}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <MdKeyboardArrowLeft />
          </ToggleBarButton>
        </Header>

        <TabNavItem id="notespaces" {...tabHandler} onClick={openSidebar}>
          <TbNotebook />
        </TabNavItem>

        <TabNavItem
          id="select"
          {...tabHandler}
          onClick={() => toggleMode(MODES.select)}
        >
          <CursorRotate>
            <GiPlayButton />
          </CursorRotate>
        </TabNavItem>

        <TabNavItem
          id="draw"
          {...tabHandler}
          onClick={() => toggleMode(MODES.draw)}
        >
          <MdDraw />
        </TabNavItem>

        <TabNavItem
          id="pan"
          {...tabHandler}
          onClick={() => toggleMode(MODES.pan)}
        >
          <RiDragMoveLine />
        </TabNavItem>

        <TabNavItem
          id="text_add"
          {...tabHandler}
          onClick={() => toggleMode(MODES.text_add)}
        >
          <MdOutlineTextFields />
        </TabNavItem>

        <TabNavItem id="share" onClick={openSidebar} {...tabHandler}>
          <MdShare />
        </TabNavItem>

        {/* <PropertyButton>
          <MdLockOpen />
        </PropertyButton> */}
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
            exit={{ y: -10, opacity: 0 }}
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
{
  /* <PropertyButton
            selected={renderMode === MODES.text_edit}
            onClick={() => toggleMode(MODES.text_edit)}
          >
            text_edit
          </PropertyButton>
          <PropertyButton
            onClick={() => setBackground("dot", "white", "#292929")}
          >
            dot
          </PropertyButton>
          <PropertyButton
            onClick={() => setBackground("grid", "white", "#292929")}
          >
            grid
          </PropertyButton>
          <PropertyButton
            onClick={() => setBackground("hline", "white", "#292929")}
          >
            hline
          </PropertyButton>
          <PropertyButton
            onClick={() => setBackground("vline", "white", "#292929")}
          >
            vline
          </PropertyButton> */
}
