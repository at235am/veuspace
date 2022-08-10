// libary:
import styled from "@emotion/styled";
import { motion } from "framer-motion";

const borderRadius = 5;

export const Container = styled(motion.div)`
  /* border: 1px solid pink; */
  position: relative;

  width: 100%;

  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  position: relative;

  padding: 0.5rem;

  background-color: #222;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const toolBarSize = 50;

export const ToolbarContainer = styled.ul`
  /* border: 2px dashed red; */

  z-index: 2;
  position: relative;

  overflow: hidden;
  border-radius: ${borderRadius}px;
  padding: 4px;

  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;

  background-color: rgba(70, 70, 70, 0.75);
  backdrop-filter: blur(15px);

  display: flex;
  flex-direction: row;
  gap: 2px;
`;

export const ToolPropertiesContainer = styled(motion.div)`
  /* border: 1px dashed blue; */
  z-index: 1;
  position: relative;

  display: flex;
  flex-direction: column;
`;

export const FloatContainer = styled(motion.div)`
  /* border: 1px dashed red; */
  margin-top: 0.5rem;

  overflow: hidden;
  border-radius: ${borderRadius}px;

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
  /* background-color: #111; */
  padding: 1rem;
`;
