// styling:
import { css, jsx, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import type { AppProps } from "next/app";
// import { ThemeStateProvider } from "../contexts/ThemeContext";
import {
  ThemeControllerProvider,
  useThemeController,
} from "../styles/theme/Theme.context";
import { UIStateProvider } from "../contexts/UIContext";
import { useRouter } from "next/router";
import { NextPage } from "next/types";
import { ReactElement, ReactNode, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
// import MinimalLayout from "../components/MinimalLayout";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <ThemeControllerProvider>
      <UIStateProvider>
        {getLayout(<Component {...pageProps} />)}
      </UIStateProvider>
    </ThemeControllerProvider>
  );
};

export default App;
