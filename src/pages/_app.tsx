import type { AppProps } from "next/app";
import type { NextPage } from "next/types";
import type { ReactElement, ReactNode } from "react";
import { ThemeControllerProvider } from "../styles/theme/Theme.context";
import { UIStateProvider } from "../contexts/UIContext";
import { DefaultLayout } from "../components/layouts/DefaultLayout";

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
