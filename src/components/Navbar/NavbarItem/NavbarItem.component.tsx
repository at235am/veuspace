import React, { useState } from "react";
import Link from "next/link";
import { A, Text } from "./NavbarItem.styles";

// types:
import { TablerIcon } from "@tabler/icons";

type Props = {
  color?: string;
  name: string;
  icon?: TablerIcon;
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
