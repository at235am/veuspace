// libary:
import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled(motion.div)`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  height: 100%;

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  display: flex;
  flex-direction: row;
`;

export const Header = styled.div`
  position: relative;
  width: 100%;

  padding: 0.5rem;

  background-color: #222;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const toolBarWidth = 50;

export const ToolWrapper = styled.ul`
  min-width: ${toolBarWidth}px;
  max-width: ${toolBarWidth}px;
  padding: 2px;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Toolbar = styled.div`
  /* border: 1px solid red; */

  background-color: #303030;
  background-color: rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: column;
`;

export const ActivityBar = styled.ul`
  /* border: 1px solid blue; */

  overflow: hidden;

  width: 18rem;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

export const ToggleBarButton = styled(motion.button)`
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

export const TC = styled.div`
  background-color: #111;
  padding: 1rem;
`;
