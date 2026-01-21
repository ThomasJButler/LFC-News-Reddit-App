/**
 * @fileoverview Tests for Avatar component
 * WHY: Avatar component displays user avatars in comment threads.
 * Tests verify correct rendering, accessibility, and responsive behaviour.
 * Note: Uses the real colorHash utility since it's independently tested.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Avatar from '../Avatar';

describe('Avatar component', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<Avatar username="testuser" />);
      // Should render the first letter
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('displays the first letter of the username', () => {
      render(<Avatar username="alice" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders with the username as title attribute', () => {
      render(<Avatar username="bob" />);
      const avatar = screen.getByTitle('bob');
      expect(avatar).toBeInTheDocument();
    });

    it('applies inline background colour style', () => {
      render(<Avatar username="charlie" />);
      const avatar = screen.getByTitle('charlie');
      // Should have a backgroundColor style applied
      expect(avatar.style.backgroundColor).toBeTruthy();
    });

    it('applies inline text colour style', () => {
      render(<Avatar username="david" />);
      const avatar = screen.getByTitle('david');
      // Should have a color style applied
      expect(avatar.style.color).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('applies small size class when size="sm"', () => {
      render(<Avatar username="testuser" size="sm" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('sm');
    });

    it('applies medium size class when size="md"', () => {
      render(<Avatar username="testuser" size="md" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('md');
    });

    it('applies large size class when size="lg"', () => {
      render(<Avatar username="testuser" size="lg" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('lg');
    });

    it('defaults to medium size when size prop not provided', () => {
      render(<Avatar username="testuser" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('md');
    });
  });

  describe('border variant', () => {
    it('does not apply border class by default', () => {
      render(<Avatar username="testuser" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).not.toContain('withBorder');
    });

    it('applies border class when showBorder=true', () => {
      render(<Avatar username="testuser" showBorder={true} />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('withBorder');
    });

    it('does not apply border class when showBorder=false', () => {
      render(<Avatar username="testuser" showBorder={false} />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).not.toContain('withBorder');
    });

    it('applies custom border colour when provided', () => {
      render(
        <Avatar
          username="testuser"
          showBorder={true}
          borderColor="var(--lfc-red)"
        />
      );
      const avatar = screen.getByTitle('testuser');
      expect(avatar).toHaveStyle({ borderColor: 'var(--lfc-red)' });
    });

    it('does not apply border colour when showBorder=false', () => {
      render(
        <Avatar
          username="testuser"
          showBorder={false}
          borderColor="var(--lfc-red)"
        />
      );
      const avatar = screen.getByTitle('testuser');
      // Border colour should not be applied when showBorder is false
      expect(avatar.style.borderColor).toBe('');
    });
  });

  describe('custom className', () => {
    it('applies additional className when provided', () => {
      render(<Avatar username="testuser" className="custom-class" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('custom-class');
    });

    it('combines custom className with default classes', () => {
      render(<Avatar username="testuser" className="custom-class" size="lg" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('custom-class');
      expect(avatar.className).toContain('lg');
      expect(avatar.className).toContain('avatar');
    });

    it('handles empty className gracefully', () => {
      render(<Avatar username="testuser" className="" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-hidden="true" for decorative purposes', () => {
      render(<Avatar username="testuser" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });

    it('has title attribute for tooltip on hover', () => {
      render(<Avatar username="specialuser" />);
      const avatar = screen.getByTitle('specialuser');
      expect(avatar).toHaveAttribute('title', 'specialuser');
    });
  });

  describe('edge cases', () => {
    it('handles deleted user gracefully', () => {
      render(<Avatar username="[deleted]" />);
      // Should show '?' for deleted users
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('handles removed user gracefully', () => {
      render(<Avatar username="[removed]" />);
      // Should show '?' for removed users
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('handles username with special characters', () => {
      render(<Avatar username="user_with-special.chars" />);
      const avatar = screen.getByTitle('user_with-special.chars');
      expect(avatar).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('handles very long username', () => {
      const longUsername = 'a'.repeat(100);
      render(<Avatar username={longUsername} />);
      const avatar = screen.getByTitle(longUsername);
      expect(avatar).toBeInTheDocument();
    });

    it('handles username starting with number', () => {
      render(<Avatar username="123user" />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles username starting with underscore', () => {
      render(<Avatar username="_underscore" />);
      // Should get first alphanumeric character
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('styling integration', () => {
    it('renders initial inside a span with initial class', () => {
      render(<Avatar username="testuser" />);
      const initial = screen.getByText('T');
      expect(initial.tagName).toBe('SPAN');
      expect(initial.className).toContain('initial');
    });

    it('applies avatar class to container', () => {
      render(<Avatar username="testuser" />);
      const avatar = screen.getByTitle('testuser');
      expect(avatar.className).toContain('avatar');
    });
  });

  describe('colour consistency', () => {
    it('generates consistent colour for same username', () => {
      const { rerender } = render(<Avatar username="consistentuser" />);
      const avatar1 = screen.getByTitle('consistentuser');
      const color1 = avatar1.style.backgroundColor;

      rerender(<Avatar username="consistentuser" />);
      const avatar2 = screen.getByTitle('consistentuser');
      const color2 = avatar2.style.backgroundColor;

      expect(color1).toBe(color2);
    });

    it('generates same colour regardless of username case', () => {
      const { rerender } = render(<Avatar username="TestUser" />);
      const avatar1 = screen.getByTitle('TestUser');
      const color1 = avatar1.style.backgroundColor;

      rerender(<Avatar username="testuser" />);
      const avatar2 = screen.getByTitle('testuser');
      const color2 = avatar2.style.backgroundColor;

      expect(color1).toBe(color2);
    });
  });

  describe('prop types validation', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('logs warning when username is not provided', () => {
      // @ts-ignore - Intentionally testing missing required prop
      render(<Avatar />);
      // React will log a warning about missing required prop
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

describe('Avatar component with various Reddit usernames', () => {
  const testUsernames = [
    { username: 'LFC_Supporter_2024', expectedInitial: 'L' },
    { username: 'TheKop_Legend', expectedInitial: 'T' },
    { username: 'Never_Walk_Alone', expectedInitial: 'N' },
    { username: 'Anfield_Red', expectedInitial: 'A' },
    { username: 'YNWA_Forever', expectedInitial: 'Y' },
    { username: 'salah_fan_11', expectedInitial: 'S' },
  ];

  testUsernames.forEach(({ username, expectedInitial }) => {
    it(`renders correctly for username "${username}"`, () => {
      render(<Avatar username={username} />);
      expect(screen.getByTitle(username)).toBeInTheDocument();
      expect(screen.getByText(expectedInitial)).toBeInTheDocument();
    });
  });
});
