/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Application header with branding, search functionality, and theme controls.
 */

import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import Icon from '../Icon/Icon';
import styles from './Header.module.css';

/**
 * @return {JSX.Element}
 * @constructor
 */
const Header = () => {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Row 1: Branding + Search */}
        <div className={styles.headerRow}>
          <div className={styles.titleSection}>
            <div className={styles.brandingSection}>
              <h1 className={styles.title}>LFC Reddit Viewer</h1>
              <span className={styles.subtitle}>Liverpool FC Community Posts</span>
              <span className={styles.tagline}>
                <Icon name="Bird" size="sm" ariaHidden={true} className={styles.liverbirdIcon} />
                You'll Never Walk Alone
              </span>
            </div>
            <a
              href="https://github.com/thomasjbutler"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.developerLink}
              aria-label="Developed by Thomas Butler (opens in new tab)"
            >
              <Icon name="Code" size="sm" ariaHidden={true} className={styles.developerIcon} />
              Developed by Thomas Butler
            </a>
          </div>
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
        </div>

      </div>
    </header>
  );
};

export default React.memo(Header);