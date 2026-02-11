/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Unit tests for formatTime utilities.
 *
 * WHY these tests matter:
 * - Time formatting is used across all post/comment components
 * - Edge cases (0 minutes, boundary conditions) can cause confusing UI
 * - Locale-specific formatting needs verification across environments
 */

import { formatRelativeTime, formatDateTime } from '../formatTime';

describe('formatRelativeTime', () => {
  // Store original Date.now to restore after tests
  const originalDateNow = Date.now;

  beforeEach(() => {
    // Mock Date.now to return a consistent timestamp for testing
    // Using January 21, 2026 12:00:00 UTC as the "current" time
    Date.now = vi.fn(() => 1737457200000); // Unix ms timestamp
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  describe('minutes ago (< 1 hour)', () => {
    it('should return "0m ago" for timestamps within the current minute', () => {
      const now = Date.now() / 1000;
      expect(formatRelativeTime(now)).toBe('0m ago');
    });

    it('should return "1m ago" for 1 minute old timestamps', () => {
      const oneMinuteAgo = (Date.now() / 1000) - 60;
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1m ago');
    });

    it('should return "30m ago" for 30 minute old timestamps', () => {
      const thirtyMinutesAgo = (Date.now() / 1000) - (30 * 60);
      expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30m ago');
    });

    it('should return "59m ago" for timestamps just under 1 hour', () => {
      const fiftyNineMinutesAgo = (Date.now() / 1000) - (59 * 60);
      expect(formatRelativeTime(fiftyNineMinutesAgo)).toBe('59m ago');
    });
  });

  describe('hours ago (1 hour to < 1 day)', () => {
    it('should return "1h ago" for exactly 1 hour old timestamps', () => {
      const oneHourAgo = (Date.now() / 1000) - 3600;
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
    });

    it('should return "12h ago" for 12 hour old timestamps', () => {
      const twelveHoursAgo = (Date.now() / 1000) - (12 * 3600);
      expect(formatRelativeTime(twelveHoursAgo)).toBe('12h ago');
    });

    it('should return "23h ago" for timestamps just under 1 day', () => {
      const twentyThreeHoursAgo = (Date.now() / 1000) - (23 * 3600);
      expect(formatRelativeTime(twentyThreeHoursAgo)).toBe('23h ago');
    });
  });

  describe('days ago (1 day to < 1 week)', () => {
    it('should return "1d ago" for exactly 1 day old timestamps', () => {
      const oneDayAgo = (Date.now() / 1000) - 86400;
      expect(formatRelativeTime(oneDayAgo)).toBe('1d ago');
    });

    it('should return "3d ago" for 3 day old timestamps', () => {
      const threeDaysAgo = (Date.now() / 1000) - (3 * 86400);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
    });

    it('should return "6d ago" for timestamps just under 1 week', () => {
      const sixDaysAgo = (Date.now() / 1000) - (6 * 86400);
      expect(formatRelativeTime(sixDaysAgo)).toBe('6d ago');
    });
  });

  describe('locale date (>= 1 week)', () => {
    it('should return locale date for exactly 1 week old timestamps', () => {
      const oneWeekAgo = (Date.now() / 1000) - 604800;
      const result = formatRelativeTime(oneWeekAgo);
      // Should be a locale date string, not relative time
      expect(result).not.toContain('ago');
      expect(result).toMatch(/\d/); // Should contain numbers (date)
    });

    it('should return locale date for 30 day old timestamps', () => {
      const thirtyDaysAgo = (Date.now() / 1000) - (30 * 86400);
      const result = formatRelativeTime(thirtyDaysAgo);
      expect(result).not.toContain('ago');
      expect(result).toMatch(/\d/);
    });

    it('should return locale date for very old timestamps', () => {
      const oneYearAgo = (Date.now() / 1000) - (365 * 86400);
      const result = formatRelativeTime(oneYearAgo);
      expect(result).not.toContain('ago');
      expect(result).toMatch(/\d/);
    });
  });

  describe('boundary conditions', () => {
    it('should handle boundary between minutes and hours (59m59s vs 1h)', () => {
      // Just under 1 hour should show minutes
      const justUnderHour = (Date.now() / 1000) - 3599;
      expect(formatRelativeTime(justUnderHour)).toBe('59m ago');

      // Exactly 1 hour should show hours
      const exactlyHour = (Date.now() / 1000) - 3600;
      expect(formatRelativeTime(exactlyHour)).toBe('1h ago');
    });

    it('should handle boundary between hours and days', () => {
      // Just under 1 day should show hours
      const justUnderDay = (Date.now() / 1000) - 86399;
      expect(formatRelativeTime(justUnderDay)).toBe('23h ago');

      // Exactly 1 day should show days
      const exactlyDay = (Date.now() / 1000) - 86400;
      expect(formatRelativeTime(exactlyDay)).toBe('1d ago');
    });

    it('should handle boundary between days and locale date', () => {
      // Just under 1 week should show days
      const justUnderWeek = (Date.now() / 1000) - 604799;
      expect(formatRelativeTime(justUnderWeek)).toBe('6d ago');

      // Exactly 1 week should show locale date
      const exactlyWeek = (Date.now() / 1000) - 604800;
      expect(formatRelativeTime(exactlyWeek)).not.toContain('ago');
    });
  });
});

describe('formatDateTime', () => {
  it('should return a locale string containing date and time', () => {
    // Known timestamp: January 1, 2026 00:00:00 UTC
    const timestamp = 1767225600;
    const result = formatDateTime(timestamp);

    // Should be a string
    expect(typeof result).toBe('string');

    // Should contain numbers (for date/time)
    expect(result).toMatch(/\d/);

    // Locale string should have reasonable length
    expect(result.length).toBeGreaterThan(5);
  });

  it('should correctly convert Unix seconds to Date', () => {
    // January 15, 2025 10:10:00 UTC = 1736935800 seconds
    const timestamp = 1736935800;
    const result = formatDateTime(timestamp);

    // The date should contain 2025 (year)
    expect(result).toContain('2025');
  });

  it('should handle timestamps at Unix epoch', () => {
    // Unix epoch: January 1, 1970 00:00:00 UTC
    const timestamp = 0;
    const result = formatDateTime(timestamp);

    expect(typeof result).toBe('string');
    expect(result).toContain('1970');
  });

  it('should handle current timestamps', () => {
    const now = Math.floor(Date.now() / 1000);
    const result = formatDateTime(now);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
