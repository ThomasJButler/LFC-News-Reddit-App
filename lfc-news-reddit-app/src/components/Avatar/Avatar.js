import React from 'react';
import PropTypes from 'prop-types';
import { getAvatarData } from '../../utils/colorHash';
import styles from './Avatar.module.css';

/**
 * Avatar Component
 * Displays a circular avatar with the first letter of the username.
 * Background color is generated consistently from the username hash.
 *
 * @param {Object} props
 * @param {string} props.username - The Reddit username to display
 * @param {string} props.size - Size variant: 'sm' (28px), 'md' (32px), 'lg' (44px)
 * @param {string} props.className - Additional CSS class names
 * @param {boolean} props.showBorder - Whether to show a subtle border
 * @param {string} props.borderColor - Optional custom border color (uses thread depth colors)
 */
function Avatar({
  username,
  size = 'md',
  className = '',
  showBorder = false,
  borderColor = null,
}) {
  const { backgroundColor, textColor, initial } = getAvatarData(username);

  const sizeClass = styles[size] || styles.md;
  const borderClass = showBorder ? styles.withBorder : '';

  const inlineStyles = {
    backgroundColor,
    color: textColor,
    ...(borderColor && showBorder ? { borderColor } : {}),
  };

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${borderClass} ${className}`.trim()}
      style={inlineStyles}
      aria-hidden="true"
      title={username}
    >
      <span className={styles.initial}>{initial}</span>
    </div>
  );
}

Avatar.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  showBorder: PropTypes.bool,
  borderColor: PropTypes.string,
};

export default Avatar;
