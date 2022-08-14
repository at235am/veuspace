import styled from "@emotion/styled";
import { motion } from "framer-motion";

const size = 50;

export const Container = styled.li<{ active: boolean }>`
  position: relative;

  width: ${size}px;
  min-width: ${size}px;
  max-width: ${size}px;
  height: ${size}px;
  min-height: ${size}px;
  max-height: ${size}px;
  /* aspect-ratio: 1 / 1; */
  border-radius: 7px;

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
      active ? theme.colors.primary.B00 : "auto"};
    path {
      /* fill: blue; */
    }
  }
`;

export const Line = styled(motion.span)`
  z-index: 10;
  position: absolute;
  /* top: calc((46px - 34px) / 2); */
  bottom: -3px;
  /* bottom: 0; */
  right: calc((${size}px - 40px) / 2);

  min-height: 3px;
  width: 40px;
  border-radius: 5px;

  background-color: ${({ theme }) => theme.colors.primary.B00};
`;

export const KeybindLabel = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  /* top: -2px; */
  /* right: 0; */
  /* margin: 0 auto; */

  background-color: ${({ theme }) => theme.colors.surface.D10};
  width: 12px;
  height: 12px;

  border-radius: 2px;
  /* width: 100%; */

  /* border-radius: 50%; */
  /* border-bottom-right-radius: 0; */
  /* border-top-right-radius: 0; */

  /* border-top: 1px solid gray; */
  /* border-left: 1px solid gray; */

  /* color: ${({ theme }) => theme.colors.onBackground.B00}; */
  color: lightgrey;
  font-size: 9px;
  font-weight: 500;

  text-transform: uppercase;

  display: flex;
  justify-content: center;
  align-items: center;
`;
