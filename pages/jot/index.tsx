import styled from "@emotion/styled";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { NextPage } from "next/types";

// custom components:
import MinimalLayout from "../../components/MinimalLayout";
import Sidebar from "../../components/Sidebar";
import PaperSpace from "../../components/PaperSpace";

// contexts:
// import { PaperSpaceStateProvider } from "../../contexts/PaperSpaceContext";
import { PaperStateProvider } from "../../contexts/PaperContext";

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

type Props = {};

type PageWithMinimalLayout = NextPage<Props> & {
  getLayout: (page: ReactElement) => ReactNode;
};

const Jot: PageWithMinimalLayout = () => {
  return (
    <Container>
      <PaperStateProvider>
        <Wrapper>
          <Float>
            <Sidebar />
          </Float>
          <PaperSpace />
        </Wrapper>
      </PaperStateProvider>
    </Container>
  );
};

Jot.getLayout = function getLayout(page: ReactElement) {
  return <MinimalLayout>{page}</MinimalLayout>;
};

export default Jot;
