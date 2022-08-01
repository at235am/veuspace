import { Theme, ThemeProvider } from "@emotion/react";
import React, { createContext, useContext, useState } from "react";
import { arrayToObject, getRandomIntInclusive } from "../../utils/utils";
import { GlobalStyles } from "./GlobalStyles";
// import { THEMES } from "./Theme.defaults";
import { themeList } from "./Theme.list";

type State = {
  selectedTheme: string;
  currentTheme: Theme;
  themes: { [name: string]: Theme };
  toggleBetweenLightAndDarkMode: () => void;
  switchToRandomTheme: () => void;
  // changeCustomTheme: (fn: (a: Theme) => Theme) => void;
  switchToTheme: (id: string) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const THEMES = arrayToObject(themeList);

const ThemeControllerContext = createContext<State | undefined>(undefined);

/**
 * ThemeControllerProvider wraps both emotion's ThemeProvider with our own custom ThemeControllerContext provider.
 * We use our custom ThemeControllerProvider to control the Themes then pass those values down to
 * emotion's ThemeProvider to provide us our theme object values in emotion's styled components.
 */
const ThemeControllerProvider = ({ children }: ThemeProviderProps) => {
  const [themes, setThemes] = useState(THEMES);
  const [selectedThemeId, setSelectedThemeId] = useState("dark");
  const currentTheme = themes[selectedThemeId];

  const switchToTheme = (id: string) => {
    const newTheme = themes[id];
    if (!newTheme) return;
    setSelectedThemeId(id);
  };

  const switchToRandomTheme = () => {
    const themeIds = Object.keys(themes);
    const randomId = themeIds[getRandomIntInclusive(0, themeIds.length - 1)];
    switchToTheme(randomId);
  };

  const toggleBetweenLightAndDarkMode = () =>
    setSelectedThemeId((val) => (val === "dark" ? "light" : "dark"));

  /** @todo implement this addTheme() */
  const addTheme = (theme: Theme) => {};

  // const changeCustomTheme = (fn: (a: Theme) => Theme) => {
  //   const newTheme = fn(themes["custom"]);
  //   setThemes((allThemes) => ({
  //     ...allThemes,
  //     custom: { ...newTheme, name: "custom" },
  //   }));
  // };

  return (
    <ThemeControllerContext.Provider
      value={{
        themes,
        toggleBetweenLightAndDarkMode,
        currentTheme,
        switchToTheme,
        selectedTheme: selectedThemeId,
        // changeCustomTheme,
        switchToRandomTheme,
      }}
    >
      <ThemeProvider theme={currentTheme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </ThemeControllerContext.Provider>
  );
};

const useThemeController = () => {
  const context = useContext(ThemeControllerContext);
  if (context === undefined)
    throw new Error("useThemeController must be used within a ThemeController");
  return context;
};

export { ThemeControllerProvider, useThemeController };
