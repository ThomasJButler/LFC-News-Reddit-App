import React, { useState, useEffect } from 'react';
import styles from './ThemeSwitcher.module.css';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('red');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'red',
      name: 'Home Kit',
      color: '#C8102E',
      icon: '🏠'
    },
    {
      id: 'white',
      name: 'Away Kit',
      color: '#ffffff',
      icon: '✈️'
    },
    {
      id: 'green',
      name: 'Third Kit',
      color: '#00B2A9',
      icon: '🌊'
    }
  ];

  useEffect(() => {
    // Load theme from localStorage or default to red
    const savedTheme = localStorage.getItem('lfc-theme') || 'red';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

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
    applyTheme(themeId);
    localStorage.setItem('lfc-theme', themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(theme => theme.id === currentTheme);

  return (
    <div className={styles.themeSwitcher}>
      <button
        className={styles.themeButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change kit theme"
      >
        <span className={styles.themeIcon}>{currentThemeData.icon}</span>
        <span className={styles.themeName}>{currentThemeData.name}</span>
        <span className={styles.dropdownIcon}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.themeDropdown}>
          <div className={styles.dropdownHeader}>
            <span>Choose Your Kit</span>
          </div>
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`${styles.themeOption} ${
                currentTheme === theme.id ? styles.active : ''
              }`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <span className={styles.optionIcon}>{theme.icon}</span>
              <div className={styles.optionInfo}>
                <span className={styles.optionName}>{theme.name}</span>
                <div 
                  className={styles.colorPreview}
                  style={{ backgroundColor: theme.color }}
                />
              </div>
              {currentTheme === theme.id && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;