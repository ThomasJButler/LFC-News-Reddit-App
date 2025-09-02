import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>LFC Reddit Viewer</h1>
          <span className={styles.subtitle}>Liverpool FC Community Posts</span>
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