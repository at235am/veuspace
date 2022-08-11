import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled(motion.div)`
  z-index: 1000;

  position: fixed;
  top: 0;
  left: 0;

  top: -10px;
  left: -10px;

  width: 20px;
  height: 20px;

  background-color: white;
  mix-blend-mode: difference;

  border-radius: 50%;

  pointer-events: none;
`;
