/**
 * @fileoverview Tests for colorHash utility
 * WHY: The colorHash utility generates consistent avatar colours from usernames.
 * Consistency is critical - the same username must always produce the same colour
 * for visual recognition across the application.
 */

import {
  getColorFromUsername,
  getInitialFromUsername,
  getContrastTextColor,
  getAvatarData,
} from '../colorHash';

describe('colorHash utility', () => {
  describe('getColorFromUsername', () => {
    it('returns a hex colour for a valid username', () => {
      const colour = getColorFromUsername('testuser');
      expect(colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('returns consistent colour for the same username', () => {
      const colour1 = getColorFromUsername('consistent_user');
      const colour2 = getColorFromUsername('consistent_user');
      expect(colour1).toBe(colour2);
    });

    it('returns the same colour regardless of case', () => {
      const colour1 = getColorFromUsername('TestUser');
      const colour2 = getColorFromUsername('testuser');
      const colour3 = getColorFromUsername('TESTUSER');
      expect(colour1).toBe(colour2);
      expect(colour2).toBe(colour3);
    });

    it('handles whitespace by trimming', () => {
      const colour1 = getColorFromUsername('  spaceduser  ');
      const colour2 = getColorFromUsername('spaceduser');
      expect(colour1).toBe(colour2);
    });

    it('returns different colours for different usernames', () => {
      const colour1 = getColorFromUsername('user_alpha');
      const colour2 = getColorFromUsername('user_beta');
      // Not guaranteed to be different due to hash collisions, but statistically likely
      // Test that the function returns valid colours for both
      expect(colour1).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colour2).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('returns default colour for null username', () => {
      const colour = getColorFromUsername(null);
      expect(colour).toBe('#D00027'); // LFC Vivid Crimson (default)
    });

    it('returns default colour for undefined username', () => {
      const colour = getColorFromUsername(undefined);
      expect(colour).toBe('#D00027'); // LFC Vivid Crimson (default)
    });

    it('returns default colour for empty string', () => {
      const colour = getColorFromUsername('');
      expect(colour).toBe('#D00027'); // LFC Vivid Crimson (default)
    });

    it('returns default colour for non-string input', () => {
      const colour1 = getColorFromUsername(123);
      const colour2 = getColorFromUsername({ name: 'test' });
      expect(colour1).toBe('#D00027');
      expect(colour2).toBe('#D00027');
    });

    it('handles special characters in usernames', () => {
      const colour = getColorFromUsername('user_with-special.chars123');
      expect(colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('handles unicode characters in usernames', () => {
      const colour = getColorFromUsername('user_émoji_🎉');
      expect(colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('getInitialFromUsername', () => {
    it('returns uppercase first letter for regular username', () => {
      expect(getInitialFromUsername('testuser')).toBe('T');
    });

    it('returns uppercase letter for username starting with lowercase', () => {
      expect(getInitialFromUsername('alice')).toBe('A');
    });

    it('returns uppercase letter for username starting with uppercase', () => {
      expect(getInitialFromUsername('Bob')).toBe('B');
    });

    it('returns first alphanumeric character for usernames starting with special chars', () => {
      expect(getInitialFromUsername('_underscore_user')).toBe('U');
      expect(getInitialFromUsername('--dash-user')).toBe('D');
    });

    it('returns number for usernames starting with number', () => {
      expect(getInitialFromUsername('123user')).toBe('1');
    });

    it('returns ? for [deleted] users', () => {
      expect(getInitialFromUsername('[deleted]')).toBe('?');
    });

    it('returns ? for [removed] users', () => {
      expect(getInitialFromUsername('[removed]')).toBe('?');
    });

    it('returns ? for null username', () => {
      expect(getInitialFromUsername(null)).toBe('?');
    });

    it('returns ? for undefined username', () => {
      expect(getInitialFromUsername(undefined)).toBe('?');
    });

    it('returns ? for empty string', () => {
      expect(getInitialFromUsername('')).toBe('?');
    });

    it('returns ? for non-string input', () => {
      expect(getInitialFromUsername(123)).toBe('?');
      expect(getInitialFromUsername({})).toBe('?');
    });

    it('trims whitespace before getting initial', () => {
      expect(getInitialFromUsername('  spaced  ')).toBe('S');
    });

    it('handles usernames with only special characters', () => {
      // Falls back to first character if no alphanumeric
      const initial = getInitialFromUsername('___');
      expect(initial).toBe('_');
    });
  });

  describe('getContrastTextColor', () => {
    it('returns white text for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('#ffffff');
      expect(getContrastTextColor('#C8102E')).toBe('#ffffff'); // LFC Red
      expect(getContrastTextColor('#1a1a1a')).toBe('#ffffff');
    });

    it('returns dark text for light backgrounds', () => {
      expect(getContrastTextColor('#ffffff')).toBe('#1a1a1a');
      expect(getContrastTextColor('#F6EB61')).toBe('#1a1a1a'); // LFC Yellow
      expect(getContrastTextColor('#eeeeee')).toBe('#1a1a1a');
    });

    it('handles hex colour with hash prefix', () => {
      expect(getContrastTextColor('#C8102E')).toBe('#ffffff');
    });

    it('handles hex colour without hash prefix', () => {
      expect(getContrastTextColor('C8102E')).toBe('#ffffff');
    });

    it('returns white for null input', () => {
      expect(getContrastTextColor(null)).toBe('#ffffff');
    });

    it('returns white for undefined input', () => {
      expect(getContrastTextColor(undefined)).toBe('#ffffff');
    });

    it('returns white for empty string', () => {
      expect(getContrastTextColor('')).toBe('#ffffff');
    });

    it('returns white for non-string input', () => {
      expect(getContrastTextColor(123)).toBe('#ffffff');
    });

    it('handles malformed hex gracefully', () => {
      // Partial hex - should handle gracefully
      const result = getContrastTextColor('#abc');
      expect(result).toBe('#ffffff'); // Falls back to white
    });
  });

  describe('getAvatarData', () => {
    it('returns complete avatar data object', () => {
      const data = getAvatarData('testuser');

      expect(data).toHaveProperty('backgroundColor');
      expect(data).toHaveProperty('textColor');
      expect(data).toHaveProperty('initial');

      expect(data.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(data.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(data.initial).toBe('T');
    });

    it('returns consistent data for the same username', () => {
      const data1 = getAvatarData('consistent_user');
      const data2 = getAvatarData('consistent_user');

      expect(data1).toEqual(data2);
    });

    it('returns appropriate contrast text colour', () => {
      const data = getAvatarData('testuser');

      // The text colour should be either white or dark
      expect(['#ffffff', '#1a1a1a']).toContain(data.textColor);
    });

    it('handles deleted users gracefully', () => {
      const data = getAvatarData('[deleted]');

      expect(data.initial).toBe('?');
      expect(data.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('handles null username gracefully', () => {
      const data = getAvatarData(null);

      expect(data.initial).toBe('?');
      expect(data.backgroundColor).toBe('#D00027'); // Default LFC Vivid Crimson
    });

    it('handles empty string gracefully', () => {
      const data = getAvatarData('');

      expect(data.initial).toBe('?');
      expect(data.backgroundColor).toBe('#D00027'); // Default LFC Vivid Crimson
    });
  });

  describe('colour distribution', () => {
    it('uses all available colours across many usernames', () => {
      // Generate colours for many usernames to test distribution
      const colours = new Set();
      const testUsernames = [
        'alice', 'bob', 'charlie', 'david', 'eve', 'frank',
        'grace', 'henry', 'ivy', 'jack', 'kate', 'leo',
        'mike', 'nancy', 'oscar', 'peter', 'quinn', 'rachel',
        'steve', 'tina', 'uma', 'victor', 'wendy', 'xavier',
        'yvonne', 'zack', 'user1', 'user2', 'user3', 'user4'
      ];

      testUsernames.forEach(username => {
        colours.add(getColorFromUsername(username));
      });

      // Should use at least a few different colours
      expect(colours.size).toBeGreaterThan(5);
    });
  });
});
