import { Theme } from "@emotion/react";
import {
  DEFAULT_DIMENSIONS,
  DEFAULT_FONT,
  DEFAULT_BREAKPOINTS,
} from "./Theme.defaults";

import { createColorSpread as ccs } from "./Theme.utils";

export const themeList: Theme[] = [
  {
    id: "dark",
    dimensions: DEFAULT_DIMENSIONS,
    font: DEFAULT_FONT,
    breakpoints: DEFAULT_BREAKPOINTS,
    colors: {
      primary: ccs({ main: "#49d0b0", darker: "#007258" }),
      secondary: ccs({ main: "#2dc3e9" }),
      background: ccs({
        lighter: "#383838",
        light: "#272727",
        main: "#222222",
        dark: "#1a1a1a",
        darker: "#000000",
      }),
      surface: ccs({
        lighter: "#505050",
        light: "#3e3e3e",
        main: "#383838",
        darker: "#222222",
      }),

      onPrimary: ccs({ main: "#ffffff" }),
      onSecondary: ccs({ main: "#ffffff" }),

      onBackground: ccs({
        main: "#ffffff",
        dark: "#e6e6e7",
        darker: "#e0e0e0",
      }),
      onSurface: ccs({ main: "#ffffff", dark: "#e6e6e7", darker: "#e0e0e0" }),

      info: ccs({ main: "#51acfe" }),
      success: ccs({ main: "#37d7b2", light: "#00ffb1" }),
      caution: ccs({ main: "#ffcd4a" }),
      danger: ccs({ main: "#fb494a" }),
    },
  },
  {
    id: "light",
    dimensions: DEFAULT_DIMENSIONS,
    font: DEFAULT_FONT,
    breakpoints: DEFAULT_BREAKPOINTS,
    colors: {
      primary: ccs({ main: "#49d0b0", light: "#bbf3fb", darker: "#007258" }),
      secondary: ccs({ main: "#6c63ff" }),

      background: ccs({ main: "#f7f7f7", dark: "#e9eef8", darker: "#f6f6f6" }),
      surface: ccs({ main: "#ffffff", dark: "#e0e0e0", darker: "#e6e6e7" }),

      onPrimary: ccs({ main: "#ffffff" }),
      onSecondary: ccs({ main: "#000000" }),

      onBackground: ccs({ main: "#2d4665" }),
      onSurface: ccs({ main: "#222222" }),

      info: ccs({ main: "#217aff" }),
      success: ccs({ main: "#37d7b2" }),
      caution: ccs({ main: "#fee257" }),
      danger: ccs({ main: "#ff3939", light: "#fd5050" }),
    },
  },
];
