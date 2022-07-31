import styled from "@emotion/styled";
import { motion } from "framer-motion";
import React, { Dispatch, SetStateAction, useEffect } from "react";

// contexts:

const Container = styled.li<{ active: boolean }>`
  position: relative;

  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 2px;

  background-color: ${({ active }) => (active ? "#00000020" : "transparent")};

  &:hover {
    background-color: #00000030;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 100%;

  color: white;

  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Line = styled(motion.span)`
  z-index: 10;
  position: absolute;
  top: calc((46px - 34px) / 2);
  right: -2px;

  height: 34px;
  min-width: 2px;
  border-radius: 5px;

  background-color: ${({ theme }) => theme.colors.primary.main};
`;

type Props = {
  id: string;
  children: React.ReactNode;
  activeTool: string;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  onClick?: () => void;
};

const TabNavItem = ({
  id,
  children,
  activeTool,
  activeTab,
  setActiveTab,
  onClick,
}: Props) => {
  // const { mode, renderMode, toggleMode } = usePaperSpaceState();
  const highlight = id === activeTool || id === activeTab;

  const action = () => {
    setActiveTab(id);
    onClick && onClick();
  };

  return (
    <Container active={highlight}>
      {id === activeTab && <Line layoutId="line" />}
      <Button onClick={action}>{children}</Button>
    </Container>
  );
};

export default TabNavItem;
