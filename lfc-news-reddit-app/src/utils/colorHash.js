/**
 * Color Hash Utility
 * Generates consistent background colors from usernames for avatar placeholders.
 * Uses a hash function to ensure the same username always gets the same color.
 */

/**
 * LFC-themed color palette for avatars
 * Includes Liverpool FC brand colors and complementary tones
 */
const AVATAR_COLORS = [
  '#C8102E', // LFC Red (primary)
  '#00A651', // LFC Green
  '#F6EB61', // LFC Yellow
  '#1E90FF', // Dodger Blue (contrast)
  '#9B59B6', // Amethyst Purple
  '#E67E22', // Carrot Orange
  '#1ABC9C', // Turquoise
  '#E74C3C', // Alizarin Red
  '#3498DB', // Peter River Blue
  '#2ECC71', // Emerald Green
  '#F39C12', // Sun Flower Yellow
  '#8E44AD', // Wisteria Purple
  '#16A085', // Green Sea
  '#D35400', // Pumpkin Orange
  '#C0392B', // Pomegranate Red
  '#27AE60', // Nephritis Green
];

/**
 * Simple string hash function (djb2 algorithm)
 * Produces a consistent numeric hash for any string input
 * @param {string} str - The string to hash
 * @returns {number} A positive integer hash value
 */
function hashString(str) {
  if (!str || typeof str !== 'string') {
    return 0;
  }

  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
  }
  return Math.abs(hash);
}

/**
 * Generates a consistent background color for a username
 * @param {string} username - The Reddit username
 * @returns {string} A hex color code
 */
export function getColorFromUsername(username) {
  if (!username || typeof username !== 'string') {
    return AVATAR_COLORS[0]; // Default to LFC Red
  }

  // Normalize username (lowercase, trim)
  const normalizedUsername = username.toLowerCase().trim();
  const hash = hashString(normalizedUsername);
  const colorIndex = hash % AVATAR_COLORS.length;

  return AVATAR_COLORS[colorIndex];
}

/**
 * Gets the first letter of a username for avatar display
 * Handles special cases like [deleted] users
 * @param {string} username - The Reddit username
 * @returns {string} A single uppercase letter
 */
export function getInitialFromUsername(username) {
  if (!username || typeof username !== 'string') {
    return '?';
  }

  const trimmed = username.trim();

  // Handle deleted/removed users
  if (trimmed === '[deleted]' || trimmed === '[removed]') {
    return '?';
  }

  // Get first alphanumeric character
  const match = trimmed.match(/[a-zA-Z0-9]/);
  if (match) {
    return match[0].toUpperCase();
  }

  // Fallback to first character if no alphanumeric
  return trimmed.charAt(0).toUpperCase() || '?';
}

/**
 * Determines if text should be light or dark based on background color
 * Uses relative luminance calculation for WCAG contrast
 * @param {string} hexColor - The background color in hex format
 * @returns {string} Either '#ffffff' or '#1a1a1a' for optimal contrast
 */
export function getContrastTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') {
    return '#ffffff';
  }

  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use dark text on light backgrounds, light text on dark backgrounds
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

/**
 * Gets complete avatar styling data for a username
 * @param {string} username - The Reddit username
 * @returns {Object} Object containing backgroundColor, textColor, and initial
 */
export function getAvatarData(username) {
  const backgroundColor = getColorFromUsername(username);
  const textColor = getContrastTextColor(backgroundColor);
  const initial = getInitialFromUsername(username);

  return {
    backgroundColor,
    textColor,
    initial,
  };
}

const colorHashUtils = {
  getColorFromUsername,
  getInitialFromUsername,
  getContrastTextColor,
  getAvatarData,
};

export default colorHashUtils;
