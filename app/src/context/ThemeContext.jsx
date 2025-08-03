import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
     localStorage.setItem('theme', theme);

    // Remove previous theme class from body
    document.body.classList.remove('light', 'dark');
    // Add new theme class
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* <div className={`theme-wrapper ${theme}`}> */}
        {children}
      {/* </div> */}
    </ThemeContext.Provider>
  );
}
