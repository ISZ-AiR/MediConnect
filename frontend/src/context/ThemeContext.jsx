import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [bgOpacity, setBgOpacity] = useState(0.85);
  const [bgBlur, setBgBlur] = useState(10);
  const [bgBrightness, setBgBrightness] = useState(1.0);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/settings/");

        if (response && response.success && response.data) {
          setTheme(response.data.theme || "light");
          setBackgroundUrl(response.data.background_url || "");
          setBgOpacity(response.data.bg_opacity ?? 0.85);
          setBgBlur(response.data.bg_blur ?? 10);
          setBgBrightness(response.data.bg_brightness ?? 1.0);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.style.setProperty('--app-bg-opacity', bgOpacity);
    root.style.setProperty('--app-bg-blur', `${bgBlur}px`);
    root.style.setProperty('--app-bg-brightness', bgBrightness);

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);

    if (backgroundUrl) {
      document.body.style.backgroundImage = `url("${backgroundUrl}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [theme, backgroundUrl, bgOpacity, bgBlur, bgBrightness]);

  const updateSettings = async (newTheme, newBg, newOpacity, newBlur, newBrightness) => {
    try {
      await apiRequest("/settings/", {
        method: "PATCH",
        body: JSON.stringify({
          theme: newTheme,
          background_url: newBg,
          bg_opacity: newOpacity,
          bg_blur: newBlur,
          bg_brightness: newBrightness
        }),
      });

      setTheme(newTheme);
      setBackgroundUrl(newBg);
      setBgOpacity(newOpacity);
      setBgBlur(newBlur);
      setBgBrightness(newBrightness);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme, backgroundUrl, bgOpacity, bgBlur, bgBrightness,
      setBgOpacity, setBgBlur, setBgBrightness,
      updateSettings, loading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};