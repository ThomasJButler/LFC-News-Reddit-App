/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Viral/spiciness indicator visualising Reddit post score with chilli pepper levels.
 *              Score thresholds: 10000+ Legendary, 5000+ Blazing, 1000+ Hot, 500+ Warm, 100+ Mild
 */

import React from 'react';
import styles from './SpicyMeter.module.css';

/**
 * @param {Object} props
 * @param {number} props.score - Reddit post score (upvotes minus downvotes)
 * @return {JSX.Element}
 * @constructor
 */
const SpicyMeter = ({ score }) => {
  /**
   * @param {number} score - Post score to evaluate
   * @return {{level: number, text: string}} Spiciness level and label
   */
  const getSpiciness = (score) => {
    if (score >= 10000) return { level: 5, text: 'Legendary' };
    if (score >= 5000) return { level: 4, text: 'Blazing' };
    if (score >= 1000) return { level: 3, text: 'Hot' };
    if (score >= 500) return { level: 2, text: 'Warm' };
    if (score >= 100) return { level: 1, text: 'Mild' };
    return { level: 1, text: 'Cool' };
  };

  const spiciness = getSpiciness(score);

  const renderChilis = (level) => {
    const chilis = [];
    for (let i = 0; i < 5; i++) {
      chilis.push(
        <span 
          key={i} 
          className={`${styles.chili} ${i < level ? styles.active : styles.inactive}`}
        >
          🌶️
        </span>
      );
    }
    return chilis;
  };

  return (
    <div className={styles.spicyMeter}>
      <div className={styles.chilis}>
        {renderChilis(spiciness.level)}
      </div>
      <span className={styles.spicyText}>{spiciness.text}</span>
    </div>
  );
};

export default SpicyMeter;