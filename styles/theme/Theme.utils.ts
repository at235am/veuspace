import {
  Dimension,
  Font,
  Theme,
  Breakpoints,
  Color,
  MainColor,
} from "@emotion/react";

import ColorString from "color";

/**
 * Creates a spread of colors based on a "main" color
 * @args color is an object with at least a "main" property
 * @returns Returns a Color object
 */
export const createColorSpread = (color: MainColor): Color => {
  const mainColor = ColorString(color.main);

  return {
    lighter: color.lighter ? color.lighter : mainColor.lighten(0.2).hex(),
    light: color.light ? color.light : mainColor.lighten(0.1).hex(),
    main: color.main,
    dark: color.dark ? color.dark : mainColor.darken(0.1).hex(),
    darker: color.darker ? color.darker : mainColor.darken(0.2).hex(),
  };
};

/** @todo implement createTheme */
export const createTheme = (theme: Partial<Theme>) => {
  return theme as Theme;
};
