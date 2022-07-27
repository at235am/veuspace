import styled from "@emotion/styled";
import { motion } from "framer-motion";
import React, { Dispatch, SetStateAction, useEffect } from "react";

// contexts:
import { usePaperSpaceState } from "../../../contexts/PaperSpaceContext";

const Container = styled.li<{ active: boolean }>`
  position: relative;

  background-color: ${({ active }) => (active ? "#00000020" : "transparent")};

  &:hover {
    background-color: #00000030;
  }
`;

const Button = styled.button`
  height: 3.5rem;
  width: 3.5rem;

  color: white;

  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Line = styled(motion.span)`
  z-index: 10;
  position: absolute;
  top: calc((3.5rem - 35px) / 2);
  right: -1px;

  /* margin-right: 4px; */

  height: 35px;
  min-width: 3px;
  border-radius: 5px;

  background-color: ${({ theme }) => theme.colors.primary.main};
`;

type Props = {
  id: string;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  onClick?: () => void;
};

const TabNavItem = ({
  id,
  children,
  activeTab,
  setActiveTab,
  onClick,
}: Props) => {
  const { mode, renderMode, toggleMode } = usePaperSpaceState();
  const active = id === activeTab;

  const action = () => {
    setActiveTab(id);
    onClick && onClick();
  };

  useEffect(() => {
    const currentMode = mode.current;

    if (currentMode == id) {
      setActiveTab(id);
    }
  }, [renderMode, id]);

  return (
    <Container active={active}>
      {active && <Line layoutId="line" />}
      <Button onClick={action}>{children}</Button>
    </Container>
  );
};

export default TabNavItem;
