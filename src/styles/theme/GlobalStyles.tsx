import { css, Global, useTheme } from "@emotion/react";

import circleImg from "../../../public/assets/cursor-black-circle.png";
import borderCircleImg from "../../../public/assets/cursor-border-circle.png";
import pointyCircleImg from "../../../public/assets/cursor-pointy-circle.png";

const d = circleImg.width / 2;

const defaultCursor = `url('${circleImg.src}') ${d} ${d}, auto`;
const pointerCursor = `url('${pointyCircleImg.src}') ${d} ${d}, auto`;
const borderCursor = `url('${borderCircleImg.src}') ${d} ${d}, auto`;

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

          cursor: inherit;

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
          cursor: ${defaultCursor};

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
          cursor: ${pointerCursor};

          text-decoration: none;
        }

        ul,
        ol {
          list-style-type: none;
        }

        button {
          cursor: ${pointerCursor};
          border: 0;
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
