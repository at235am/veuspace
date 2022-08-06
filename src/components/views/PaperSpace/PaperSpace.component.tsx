import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { NextPage } from "next/types";

// styles:
import { Container } from "./PaperSpace.styles";

// custom components:
import { MinimalLayout } from "../../layouts/MinimalLayout";
import dynamic from "next/dynamic";

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
