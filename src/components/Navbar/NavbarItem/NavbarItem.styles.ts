// styling:
import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const A = styled(motion.a)`
  overflow: hidden;
  cursor: pointer;

  border-radius: 10px;
  padding: 0.5rem;
  background: transparent;
  /* background-color: #fff; */

  height: 3rem;

  display: flex;
  gap: 0.5rem;

  /* filter: blur(0px); */
  /* transform-origin: 50% 50%; */
`;

export const CircleContainer = styled.div`
  z-index: 1;
  position: relative;
`;

export const CircleIcon = styled(motion.div)<{ fg: string }>`
  z-index: 2;
  position: relative;

  width: 2rem;
  height: 2rem;

  border-radius: 50%;

  background-color: ${({ fg }) => fg};
  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 1.25rem;
    height: 1.25rem;

    fill: #fff;
  }
`;

export const ACircleIcon = styled(CircleIcon)`
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
`;

export const Text = styled.span`
  z-index: 1;
  position: relative;
  /* border: 1px solid blue; */
  padding-right: 0.5rem;

  white-space: nowrap;
  font-weight: 600;

  display: flex;
  justify-content: center;
  align-items: center;
`;
