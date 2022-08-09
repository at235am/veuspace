import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled.li<{ active: boolean }>`
  position: relative;

  width: 44px;
  min-width: 44px;
  max-width: 44px;
  height: 44px;
  min-height: 44px;
  max-height: 44px;
  /* aspect-ratio: 1 / 1; */
  border-radius: 3px;

  /* background-color: ${({ active }) =>
    active ? "#00000020" : "transparent"};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary.main : "transparent"}; */

  &:hover {
    background-color: #ffffff20;
  }
`;

export const Button = styled.button<{ active: boolean }>`
  width: 100%;
  height: 100%;

  color: white;

  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    /* fill: red; */
    stroke: ${({ theme, active }) =>
      active ? theme.colors.primary.main : "auto"};
    path {
      /* fill: blue; */
    }
  }
`;

export const Line = styled(motion.span)`
  z-index: 10;
  position: absolute;
  /* top: calc((46px - 34px) / 2); */
  bottom: -2px;
  /* bottom: 0; */
  right: calc((44px - 36px) / 2);

  min-height: 2px;
  width: 36px;
  border-radius: 5px;

  background-color: ${({ theme }) => theme.colors.primary.main};
`;
