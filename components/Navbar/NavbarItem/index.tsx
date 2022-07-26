// styling:
import styled from "@emotion/styled";

import React, { useState } from "react";
import { IconType } from "react-icons";
import { motion } from "framer-motion";
import Link from "next/link";

const A = styled(motion.a)`
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

const CircleContainer = styled.div`
  z-index: 1;
  position: relative;
`;

const CircleIcon = styled(motion.div)<{ fg: string }>`
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

const ACircleIcon = styled(CircleIcon)`
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
`;

const Text = styled.span`
  z-index: 1;
  position: relative;
  /* border: 1px solid blue; */
  padding-right: 0.5rem;

  /* color: ${({ theme }) => theme.colors.background.main}; */
  white-space: nowrap;
  font-weight: 600;

  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  color?: string;
  name: string;
  icon?: IconType;
  link: string;
};

const NavbarItem = ({ name, color = "#ffffff", icon, link }: Props) => {
  const [hover, setHover] = useState(false);

  const iconAnimProps = {
    variants: {
      initial: {
        scale: 0.9,
      },
      expand: {
        scale: 12,
      },
    },
    initial: "initial",
    animate: hover ? "expand" : "initial",

    transition: { duration: 0.5 },
  };

  const bgAnimProps = {
    variants: {
      initial: {
        backgroundColor: "#ffffff",
      },
      expand: {
        backgroundColor: color,
        // transition: { delay: 0.25 },
      },
    },
    initial: "initial",
    animate: hover ? "expand" : "initial",
    transition: { duration: 0.5 },
    // transition: { duration: 0.5 },
  };

  return (
    <Link href={`${link}`} passHref>
      <A
        // {...bgAnimProps}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onBlur={() => setHover(false)}
      >
        <Text>{name}</Text>
      </A>
    </Link>
  );
};

export default NavbarItem;
