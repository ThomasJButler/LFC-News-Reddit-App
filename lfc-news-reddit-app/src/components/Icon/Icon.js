import React from 'react';
import PropTypes from 'prop-types';
import * as Icons from 'lucide-react';
import styles from './Icon.module.css';

/**
 * Centralized icon component using Lucide React
 * Provides consistent sizing and accessibility across the application
 *
 * WHY: Ensures all icons follow the same visual language and accessibility patterns
 * instead of mixing inline SVG, Unicode characters, and emoji
 */
const Icon = ({ name, size = 'md', className = '', ariaLabel, ariaHidden = false, ...props }) => {
  // Get the icon component from lucide-react
  const LucideIcon = Icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  // Map size prop to pixel values
  // WHY: Three size tiers cover all use cases - inline text (sm), buttons/UI (md), prominent elements (lg)
  const sizeMap = {
    sm: 16,  // Inline text icons
    md: 20,  // Buttons, UI elements (most common)
    lg: 32   // Empty states, prominent elements
  };

  const pixelSize = sizeMap[size] || sizeMap.md;

  // Combine custom className with size-specific class
  const iconClasses = `${styles.icon} ${styles[size]} ${className}`.trim();

  return (
    <LucideIcon
      size={pixelSize}
      className={iconClasses}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ? 'true' : undefined}
      {...props}
    />
  );
};

Icon.propTypes = {
  // Name of the Lucide icon (e.g., 'ArrowUp', 'MessageCircle', 'AlertCircle')
  name: PropTypes.string.isRequired,
  // Size variant: 'sm' (16px), 'md' (20px), 'lg' (32px)
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  // Additional CSS classes to apply
  className: PropTypes.string,
  // Accessible label for screen readers (required if ariaHidden is false)
  ariaLabel: PropTypes.string,
  // Whether to hide icon from screen readers (use true for decorative icons)
  ariaHidden: PropTypes.bool
};

// WHY: Default values are set via ES6 default parameters in the function signature
// instead of defaultProps, which is deprecated in React 18.3+

export default React.memo(Icon);
