import { css, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const contentCenter = (theme: Theme) => css`
  width: 55%;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.m}px) {
    width: 70%;
    /* background-color: red; */
  }

  @media (max-width: ${theme.breakpoints.s}px) {
    width: 95%;
    /* background-color: blue; */
  }
`;

export { contentCenter };
