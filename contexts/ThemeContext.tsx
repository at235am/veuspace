import { Theme, ThemeProvider } from "@emotion/react";
import React, { createContext, useContext, useState } from "react";
import { GlobalReset, THEMES } from "../components/Themes";

type State = {
  selectedTheme: string;
  currentTheme: Theme;
  themes: { [name: string]: Theme };
  toggleTheme: () => void;
  toggleThroughAllThemes: () => void;
  changeCustomTheme: (fn: (a: Theme) => Theme) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeStateContext = createContext<State | undefined>(undefined);

/**
 * ThemeStateProvider wraps both emotion's ThemeProvider with our own custom ThemeStateContext provider
 * We use ThemeStateProvider to get and update the state of the theme
 * while using emotion's ThemeProvider to provide us our theme object values in emotion's styled components.
 */
const ThemeStateProvider = ({ children }: ThemeProviderProps) => {
  const [themes, setThemes] = useState(THEMES);
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const currentTheme = themes[selectedTheme];
  const themeKeys = Object.keys(themes);

  const toggleThroughAllThemes = () => {
    const index = themeKeys.findIndex((str) => str === selectedTheme);
    const nextIndex = (index + 1) % themeKeys.length;
    setSelectedTheme(themeKeys[nextIndex]);
  };

  const toggleTheme = () =>
    setSelectedTheme((val) => (val === "dark" ? "light" : "dark"));

  const changeCustomTheme = (fn: (a: Theme) => Theme) => {
    const newTheme = fn(themes["custom"]);
    setThemes((allThemes) => ({
      ...allThemes,
      custom: { ...newTheme, name: "custom" },
    }));
  };

  return (
    <ThemeStateContext.Provider
      value={{
        themes,
        toggleTheme,
        currentTheme,
        selectedTheme,
        changeCustomTheme,
        toggleThroughAllThemes,
      }}
    >
      <ThemeProvider theme={currentTheme}>
        <GlobalReset />
        {children}
      </ThemeProvider>
    </ThemeStateContext.Provider>
  );
};

const useThemeState = () => {
  const context = useContext(ThemeStateContext);
  if (context === undefined)
    throw new Error("useThemeState must be used within a ThemeProvider");
  return context;
};

export { ThemeStateProvider, useThemeState };
