/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Theme switcher for Liverpool FC colour schemes (red, white, green).
 *              Persists selection to localStorage and applies via data attributes.
 */

import React, { useState, useEffect } from 'react';
import Icon from '../Icon/Icon';
import styles from './ThemeSwitcher.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const ThemeSwitcher = () => {
  // WHY: LFC-branded theme names connect with fans emotionally (kit references)
  const themes = [
    { id: 'red', name: 'Anfield Red', shortName: 'Anfield', color: '#C8102E', description: 'Home Kit' },
    { id: 'white', name: 'Away Day', shortName: 'Away', color: '#ffffff', description: 'Away Kit' },
    { id: 'green', name: 'Keeper Kit', shortName: 'Keeper', color: '#00A651', description: 'Goalkeeper' },
    { id: 'night', name: 'Night Mode', shortName: 'Night', color: '#000000', description: 'OLED Dark' }
  ];

  // WHY: System preference detection provides better UX for users who prefer dark mode
  const getSystemPreference = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'night';
    }
    return 'red';
  };

  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('lfc-theme');
    // WHY: First time users get theme based on system preference
    return savedTheme || getSystemPreference();
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
  
  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className={styles.themeSwitcher}>
      <label className={styles.themeLabel} htmlFor="theme-select">
        <Icon name="Palette" size="sm" ariaHidden={true} />
        Theme:
      </label>
      <div className={styles.selectWrapper}>
        <span
          className={styles.colorIndicator}
          style={{ backgroundColor: currentThemeData.color }}
          aria-hidden="true"
        />
        <select
          id="theme-select"
          className={styles.themeSelect}
          value={currentTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
          aria-label="Select theme"
        >
          {themes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(ThemeSwitcher);