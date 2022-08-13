import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled.div<{ z: number }>`
  /* z-index: ${({ z }) => z}; */
  z-index: -1;

  position: absolute;
  width: 100%;
  height: 100%;

  /* background-color: #222; */

  &:hover {
    /* background-color: red; */
  }
`;

export const Star = styled(motion.span)`
  position: absolute;

  background-color: white;
  top: 0;
  left: 0;

  width: 1rem;
  height: 1rem;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.caution.B00};
  }
`;
