import { css, Global, useTheme } from "@emotion/react";

export const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border: 0;
          outline: 0;

          font-family: ${theme.font.family};
          font-size: ${theme.font.size}px;
          font-weight: ${theme.font.weight};
          color: ${theme.colors.onSurface.main};
          -webkit-tap-highlight-color: transparent;

          &::selection {
            background: ${theme.colors.background.darker};
            color: ${theme.colors.onBackground.main};
          }
        }

        html {
          /* border: 2px dashed red; */
          background-color: ${theme.colors.background.main};

          overflow: hidden scroll;
          /* overflow: visible visible; */
          scroll-behavior: smooth;

          min-height: 100%;
          display: flex;
          flex-direction: column;

          body {
            /* border: 2px dashed blue; */
            flex: 1;
            display: flex;
            flex-direction: column;

            #__next {
              /* border: 2px dashed yellowgreen; */
              flex: 1;
              display: flex;
              flex-direction: column;
            }
          }
        }

        a,
        a:link,
        a:visited,
        a:hover,
        a:active {
          cursor: pointer;
          text-decoration: none;
        }

        ul,
        ol {
          list-style-type: none;
        }

        button {
          border: 0;
          cursor: pointer;
        }

        button:active,
        button:focus {
          outline: 0;
        }

        input {
          border: 0;
          outline: 0;
        }

        img {
          display: block;
        }
      `}
    />
  );
};
