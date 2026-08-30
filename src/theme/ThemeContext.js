import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES } from "./colors";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "@app_theme";

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState("light");

  // Recupera o último tema salvo
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        );

        console.log("Tema salvo:", savedTheme);

        if (savedTheme === "dark" || savedTheme === "light") {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log("Erro ao carregar o tema:", error);
      }
    }

    loadTheme();
  }, []);

  // Salva sempre que o tema mudar
  useEffect(() => {
    async function saveTheme() {
      try {
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          themeMode
        );

        console.log("Tema salvo:", themeMode);
      } catch (error) {
        console.log("Erro ao salvar o tema:", error);
      }
    }

    saveTheme();
  }, [themeMode]);

  const theme = THEMES[themeMode];

  function toggleTheme() {
    setThemeMode((currentTheme) => {
      return currentTheme === "light"
        ? "dark"
        : "light";
    });
  }

  function setTheme(mode) {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme precisa estar dentro de ThemeProvider"
    );
  }

  return context;
}