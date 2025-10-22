/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Theme switcher for Liverpool FC colour schemes (red, white, green).
 *              Persists selection to localStorage and applies via data attributes.
 */

import React, { useState, useEffect } from 'react';
import styles from './ThemeSwitcher.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const ThemeSwitcher = () => {
  const themes = [
    { id: 'red', name: 'Red', color: '#C8102E' },
    { id: 'white', name: 'White', color: '#ffffff' },
    { id: 'green', name: 'Green', color: '#00B2A9' }
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('lfc-theme') || 'red';
  });

  /**
   * @listens currentTheme - Applies theme data attribute when selection changes
   */
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);
  
  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'red') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  };
  
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('lfc-theme', themeId);
  };
  
  return (
    <div className={styles.themeSwitcher}>
      {themes.map(theme => (
        theme.id !== currentTheme && (
          <button
            key={theme.id}
            className={styles.themeButton}
            onClick={() => handleThemeChange(theme.id)}
            aria-label={`Switch to ${theme.name} theme`}
            style={{ 
              backgroundColor: theme.color,
              border: theme.id === 'white' ? '2px solid #ddd' : 'none'
            }}
          >
            <span className={styles.buttonText}>
              {theme.name}
            </span>
          </button>
        )
      ))}
    </div>
  );
};

export default ThemeSwitcher;