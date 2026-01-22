/**
 * @author Tom Butler
 * @date 2026-01-22
 * @description Tests for formatDuration utility function.
 *              WHY: Ensures video duration formatting is correct for thumbnail overlays.
 */

import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  describe('handles standard durations', () => {
    it('formats seconds under a minute as M:SS', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(5)).toBe('0:05');
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(59)).toBe('0:59');
    });

    it('formats minutes under an hour as M:SS', () => {
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(204)).toBe('3:24'); // Common video length example
      expect(formatDuration(599)).toBe('9:59');
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3599)).toBe('59:59');
    });

    it('formats hours as H:MM:SS', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(5025)).toBe('1:23:45');
      expect(formatDuration(7200)).toBe('2:00:00');
      expect(formatDuration(36000)).toBe('10:00:00');
    });
  });

  describe('handles edge cases', () => {
    it('rounds floating point seconds to nearest integer', () => {
      expect(formatDuration(1.4)).toBe('0:01');
      expect(formatDuration(1.5)).toBe('0:02');
      expect(formatDuration(59.9)).toBe('1:00');
    });

    it('returns 0:00 for invalid input', () => {
      expect(formatDuration(null)).toBe('0:00');
      expect(formatDuration(undefined)).toBe('0:00');
      expect(formatDuration('invalid')).toBe('0:00');
      expect(formatDuration(NaN)).toBe('0:00');
      expect(formatDuration(Infinity)).toBe('0:00');
      expect(formatDuration(-Infinity)).toBe('0:00');
    });

    it('returns 0:00 for negative values', () => {
      expect(formatDuration(-1)).toBe('0:00');
      expect(formatDuration(-60)).toBe('0:00');
    });

    it('handles very large durations', () => {
      // 24 hours
      expect(formatDuration(86400)).toBe('24:00:00');
      // 100 hours
      expect(formatDuration(360000)).toBe('100:00:00');
    });
  });

  describe('formatting consistency', () => {
    it('always pads seconds with leading zero', () => {
      expect(formatDuration(1)).toBe('0:01');
      expect(formatDuration(61)).toBe('1:01');
      expect(formatDuration(3601)).toBe('1:00:01');
    });

    it('pads minutes with leading zero only in hour format', () => {
      expect(formatDuration(60)).toBe('1:00');  // No leading zero on minutes
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3660)).toBe('1:01:00'); // Leading zero on minutes in H:MM:SS
    });
  });
});
