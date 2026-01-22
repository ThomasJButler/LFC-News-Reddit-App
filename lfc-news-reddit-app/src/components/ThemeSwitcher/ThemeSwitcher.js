/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Theme switcher for Liverpool FC colour schemes (red, white, green).
 *              Uses visual button group with colour swatches for desktop.
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
  // WHY: Only 3 themes matching Liverpool FC kits - Home (red), Away (white/cream), Keeper (green)
  const themes = [
    { id: 'red', name: 'Anfield Red', shortName: 'Home', color: '#C8102E', description: 'Home Kit' },
    { id: 'white', name: 'Away Day', shortName: 'Away', color: '#f5f0e8', description: 'Away Kit' },
    { id: 'green', name: 'Keeper Kit', shortName: 'Keeper', color: '#00A651', description: 'Goalkeeper' }
  ];

  // WHY: Default to red (home kit) as the primary LFC theme
  const getSystemPreference = () => {
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

  return (
    <div className={styles.themeSwitcher} role="group" aria-label="Theme selection">
      <span className={styles.themeLabel}>
        <Icon name="Palette" size="sm" ariaHidden={true} />
        Theme:
      </span>
      <div className={styles.themeButtons}>
        {themes.map(theme => (
          <button
            key={theme.id}
            type="button"
            className={`${styles.themeButton} ${currentTheme === theme.id ? styles.active : ''}`}
            onClick={() => handleThemeChange(theme.id)}
            aria-pressed={currentTheme === theme.id}
            aria-label={`${theme.name} theme`}
            title={theme.description}
          >
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: theme.color }}
              aria-hidden="true"
            />
            <span className={styles.themeName}>{theme.shortName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ThemeSwitcher);
