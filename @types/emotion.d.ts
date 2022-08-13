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
    L30: string;
    L20: string;
    L10: string;
    B00: string;
    D10: string;
    D20: string;
    D30: string;
  }

  export interface Shadow {
    _00: string;
    _10: string;
    _20: string;
    _30: string;
    _50: string;
  }

  /** MainColor is a type that says you must provide atleast a "main" property for your color */
  export type MainColor = Partial<Color> & Pick<Color, "B00">;

  export interface Theme {
    id: string;
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

      info: Color;
      success: Color;
      caution: Color;
      danger: Color;
    };
    shadows: Shadow;
  }
}
