import "@emotion/react";

declare module "@emotion/react" {
  export interface Font {
    size: number;
    family: string;
    weight: string;
  }
  export interface Dimension {
    unit: number;
    mainNav: {
      maxWidth: number;
      maxHeight: number;
    };
    subNav: {
      maxWidth: number;
      maxHeight: number;
    };
  }

  export interface Breakpoints {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  }

  export interface Color {
    main: string;
    light: string;
    lighter: string;
    dark: string;
    darker: string;
  }

  /** MainColor is a type that says you must provide atleast a "main" property for your color */
  export type MainColor = Partial<Color> & Pick<Color, "main">;

  export interface Theme {
    name: string;
    dimensions: Dimension;
    font: Font;
    breakpoints: Breakpoints;
    colors: {
      primary: Color;
      secondary: Color;
      background: Color;
      surface: Color;

      onPrimary: Color;
      onSecondary: Color;
      onBackground: Color;
      onSurface: Color;

      // error: Color;
      // correct: Color;
      // warning: Color;

      info: Color;
      success: Color;
      caution: Color;
      danger: Color;
    };
  }
}
