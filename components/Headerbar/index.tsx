// libary:
import styled from "@emotion/styled";

// nextjs:
import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { MODES, usePaperSpaceState } from "../../contexts/PaperSpaceContext";

import { MdOutlineTextFields, MdDraw } from "react-icons/md";
import { GiPlayButton } from "react-icons/gi";
import { RiDragMoveLine } from "react-icons/ri";
import { TbNotebook } from "react-icons/tb";
import Logo from "../Logo";

// contexts:

// custom components:

// icons:

const Container = styled.div`
  overflow: hidden;
  /* border-radius: 10px; */

  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);

  display: flex;
  flex-direction: row;

  height: 5rem;
`;

const Toolbar = styled.div`
  overflow: hidden;

  background-color: #303030;

  width: 4rem;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const ActivityBar = styled.div`
  width: 15rem;
  height: 100%;
`;

const Headerbar = () => {
  // const { renderMode, toggleMode, setBackground } = usePaperSpaceState();

  return (
    <Container>
      <Logo />
    </Container>
  );
};

export default Headerbar;
