import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth(); // Get user to check if logged in
  const [theme, setTheme] = useState("light");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/settings/"); // Domyślnie GET

        if (response && response.success && response.data) {
          setTheme(response.data.theme || "light");
          setBackgroundUrl(response.data.background_url || "");
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Apply visual changes to the DOM
  useEffect(() => {
    const root = window.document.documentElement;

    // Manage CSS classes for theme
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Manage Body background
    if (backgroundUrl) {
      document.body.style.backgroundImage = `url("${backgroundUrl}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [theme, backgroundUrl]);

  const updateSettings = async (newTheme, newBg) => {
    try {
      await apiRequest("/settings/", {
        method: "PATCH",
        body: JSON.stringify({
          theme: newTheme,
          background_url: newBg,
        }),
      });

      setTheme(newTheme);
      setBackgroundUrl(newBg);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, backgroundUrl, updateSettings, loading }}>
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