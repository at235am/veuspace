import styled from "@emotion/styled";
import { ReactNode } from "react";

const AppContainer = styled.div`
  /* border: 2px dashed red; */
  position: relative;

  background-color: #222;

  flex: 1; /* stretches to fill the height */

  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.breakpoints.s}px) {
    flex-direction: column;
  }
`;

const PageContainer = styled.main`
  /* border: 2px dashed green; */

  z-index: 1;
  position: relative;

  flex: 1; /* stretches to fill the height */

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

type Props = {
  children: ReactNode;
};

export const MinimalLayout = ({ children }: Props) => {
  return (
    <AppContainer id="app">
      <PageContainer id="page-container">{children}</PageContainer>
      {/* <Footer /> */}
    </AppContainer>
  );
};
