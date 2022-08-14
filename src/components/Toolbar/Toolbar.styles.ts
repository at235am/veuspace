// libary:
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

const borderRadius = 5;
export const toolBarSize = 50;

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

export const ToolbarContainer = styled.ul`
  ${({ theme }) => css`
    /* border: 2px dashed red; */
    z-index: 2;
    position: relative;

    overflow: hidden;
    border-radius: ${borderRadius}px;
    padding: 4px;

    box-shadow: ${theme.shadows._00};

    background-color: rgba(70, 70, 70, 0.75);
    background-color: ${theme.colors.surface.L10};
    backdrop-filter: blur(15px);

    display: flex;
    flex-direction: row;
    gap: 2px;
  `}
`;

export const ToolPropertiesContainer = styled(motion.div)`
  /* border: 1px dashed blue; */

  z-index: 1;
  position: relative;

  margin-top: 0.5rem;

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
