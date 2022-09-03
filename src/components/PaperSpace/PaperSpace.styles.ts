import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled.div`
  /* border: 1px dashed red; */

  /** overflow hidden is necessary to prevent a bug on mobile where the resize observer won't fire */
  overflow: hidden;
  position: relative;
  touch-action: none;
  overscroll-behavior-x: contain;

  background-color: ${({ theme }) => theme.colors.surface.B00};

  /* max-width: 100vw; */
  /* max-height: 100vh; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

export const Stage = styled(motion.svg)`
  position: absolute;
`;

export const Canvas = styled.canvas`
  position: absolute;
`;

export const Popup = styled.pre`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
`;

export const G = styled(motion.g)`
  /* border: 1px dashed gold; */
`;

export const Float = styled.pre`
  user-select: none;
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
`;
