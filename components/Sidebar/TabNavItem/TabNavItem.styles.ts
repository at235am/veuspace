import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled.li<{ active: boolean }>`
  position: relative;

  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 2px;

  background-color: ${({ active }) => (active ? "#00000020" : "transparent")};

  &:hover {
    background-color: #00000030;
  }
`;

export const Button = styled.button`
  width: 100%;
  height: 100%;

  color: white;

  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Line = styled(motion.span)`
  z-index: 10;
  position: absolute;
  top: calc((46px - 34px) / 2);
  right: -2px;

  height: 34px;
  min-width: 2px;
  border-radius: 5px;

  background-color: ${({ theme }) => theme.colors.primary.main};
`;
