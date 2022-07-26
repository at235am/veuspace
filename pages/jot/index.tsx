// styling:
import { css, jsx, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { contentCenter } from "../../styles/content-centerer";
import { fabric } from "fabric";
import useResizeObserver from "use-resize-observer/polyfilled";

import { clamp } from "../../utils/utils";
import useUpdatedState from "../../hooks/useUpdatedState";

import patternimg from "../../assets/pattern-circle3.png";
import PaperSpace from "../../components/PaperSpace";
import { NextPage } from "next/types";
import MinimalLayout from "../../components/MinimalLayout";
import { PaperSpaceStateProvider } from "../../contexts/PaperSpaceContext";
import Sidebar from "../../components/Sidebar";
import Headerbar from "../../components/Headerbar";
/* ${({ theme }) => contentCenter(theme)} */
const Container = styled.div`
  /* border: 1px solid red; */

  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  position: relative;

  flex: 1;
  display: flex;
`;

const Float = styled.div`
  z-index: 5;
  position: absolute;

  padding: 1rem;
  padding-right: 0;

  top: 0;
  left: 0;
  /* margin: 1rem; */

  height: 100%;

  display: flex;
  gap: 1rem;
`;

const B = styled.button<{ selected?: boolean }>`
  color: white;
  background-color: black;

  border: 1px solid ${({ selected }) => (selected ? "red" : "white")};
`;

type Props = {};

type HomePageWithNoLayout = NextPage<Props> & {
  getLayout: (page: ReactElement) => ReactNode;
};

const Jot: HomePageWithNoLayout = () => {
  // const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Container>
      <PaperSpaceStateProvider>
        {/* <Headerbar /> */}
        <Wrapper>
          <Float>
            <Sidebar />
          </Float>
          <PaperSpace />
        </Wrapper>
      </PaperSpaceStateProvider>
    </Container>
  );
};

Jot.getLayout = function getLayout(page: ReactElement) {
  return <MinimalLayout>{page}</MinimalLayout>;
};

export default Jot;
