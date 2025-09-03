import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import lfcLogo from '../../logo/lfc-logo.png';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <div className={styles.brandingSection}>
            <img src={lfcLogo} alt="Liverpool FC" className={styles.logo} />
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>LFC Reddit Viewer</h1>
              <span className={styles.subtitle}>Liverpool FC Community Posts</span>
            </div>
          </div>
          <a 
            href="https://github.com/thomasjbutler" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.developerLink}
          >
            Developed by Thomas Butler
          </a>
        </div>
        <div className={styles.headerActions}>
          <SearchBar />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;