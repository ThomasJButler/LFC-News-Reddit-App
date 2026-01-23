/**
 * @author Tom Butler
 * @date 2026-01-22
 * @description Formats video duration from seconds to human-readable format (M:SS or H:MM:SS).
 *              WHY: Reddit API provides video duration in seconds - this utility converts to
 *              standard video timestamp format for display on thumbnail overlays.
 */

/**
 * Formats a duration in seconds to MM:SS or H:MM:SS format
 * @param {number} seconds - Duration in seconds
 * @return {string} Formatted duration string (e.g., "3:24" or "1:23:45")
 */
export const formatDuration = (seconds) => {
  // Handle invalid input
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  // Round to nearest second for cleaner display
  const totalSeconds = Math.round(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // Format with leading zero on seconds only
  const formattedSeconds = secs.toString().padStart(2, '0');

  if (hours > 0) {
    // H:MM:SS format for videos over an hour
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  // M:SS format for videos under an hour
  return `${minutes}:${formattedSeconds}`;
};

export default formatDuration;
