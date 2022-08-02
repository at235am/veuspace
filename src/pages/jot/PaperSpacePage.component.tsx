import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { NextPage } from "next/types";

// custom components:
import { MinimalLayout } from "../../components/layouts/MinimalLayout";
import { Sidebar } from "../../components/Sidebar";
import { PaperSpace } from "../../components/PaperSpace";

// contexts:
import { PaperStateProvider } from "../../contexts/PaperContext";
import { Container, Wrapper, Float } from "./PaperSpacePage.styles";
import dynamic from "next/dynamic";
// import { PaperSpaceArea } from "./PaperSpaceArea.component";

const loader = () =>
  import("./PaperSpaceArea.component").then((mod) => mod.PaperSpaceArea);
const PaperSpaceArea = dynamic(loader, { ssr: false });

type Props = {};

type PageWithMinimalLayout = NextPage<Props> & {
  getLayout: (page: ReactElement) => ReactNode;
};

const Jot: PageWithMinimalLayout = () => {
  return (
    <Container>
      <PaperSpaceArea />
    </Container>
  );
};

Jot.getLayout = function getLayout(page: ReactElement) {
  return <MinimalLayout>{page}</MinimalLayout>;
};

export default Jot;
