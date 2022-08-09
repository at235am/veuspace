// libary:
import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled(motion.div)`
  /* border: 1px solid pink; */
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  /* width: min-content; */
  /* width: 100%; */

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);

  /* box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px; */
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

  display: flex;
  /* flex-direction: row; */
  flex-direction: column;
`;

export const Header = styled.div`
  position: relative;
  /* width: 100%; */

  padding: 0.5rem;

  background-color: #222;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const toolBarWidth = 50;

export const Toolbar = styled.div`
  /* border: 2px dashed red; */
  /* width: 100%; */

  /* width: min-content; */
  padding: 3px 12px;

  background-color: #303030;
  background-color: rgba(65, 65, 65, 0.8);

  display: flex;
  flex-direction: row;
`;

export const ToolWrapper = styled.ul`
  /* border: 1px dashed orange; */

  min-height: ${toolBarWidth}px;
  height: ${toolBarWidth}px;
  max-height: ${toolBarWidth}px;

  max-width: 100vw;

  /* border-left: 12px solid red;
  border-right: 12px solid red; */
  /* width: 100%; */

  display: flex;
  flex-direction: row;
  gap: 3px;
`;

export const SubTools = styled.ul`
  border: 1px solid red;

  padding: 0.5rem;
  /* margin: 0.25rem; */
  /* margin-right: 0; */
  display: flex;
`;

export const ActivityBar = styled.div`
  /* border: 1px dashed blue; */

  overflow: hidden;

  height: 18rem;
  /* width: 100%; */

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
