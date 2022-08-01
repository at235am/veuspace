import { Dimension, Font, Breakpoints } from "@emotion/react";

export const DEFAULT_DIMENSIONS: Dimension = {
  unit: 14,
  mainNav: {
    maxWidth: 100,
    maxHeight: 70,
  },
  subNav: {
    maxWidth: 60,
    maxHeight: 60,
  },
};

export const DEFAULT_FONT: Font = {
  size: DEFAULT_DIMENSIONS.unit,
  family: "Fira Code, sans-serif",
  weight: "400",
};

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  xs: 350,
  s: 550,
  m: 1366,
  l: 1920,
  xl: 2560,
  xxl: 4096,
};
