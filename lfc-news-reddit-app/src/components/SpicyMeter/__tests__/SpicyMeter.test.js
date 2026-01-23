/**
 * @author Tom Butler
 * @date 2026-01-22
 * @description Tests for SpicyMeter component.
 *              WHY: SpicyMeter visualises post popularity through a chilli pepper system,
 *              providing at-a-glance engagement indication. These tests verify correct
 *              level calculation, visual rendering, and accessibility compliance.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SpicyMeter from '../SpicyMeter';

describe('SpicyMeter Component', () => {
  describe('Spiciness Level Calculation', () => {
    it('shows "Legendary" with 5 chilis for scores >= 10000', () => {
      render(<SpicyMeter score={10000} />);

      expect(screen.getByText('Legendary')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Legendary (5 of 5 chilis)'
      );
    });

    it('shows "Legendary" for very high scores', () => {
      render(<SpicyMeter score={50000} />);

      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('shows "Blazing" with 4 chilis for scores >= 5000 and < 10000', () => {
      render(<SpicyMeter score={5000} />);

      expect(screen.getByText('Blazing')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Blazing (4 of 5 chilis)'
      );
    });

    it('shows "Hot" with 3 chilis for scores >= 1000 and < 5000', () => {
      render(<SpicyMeter score={1000} />);

      expect(screen.getByText('Hot')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Hot (3 of 5 chilis)'
      );
    });

    it('shows "Warm" with 2 chilis for scores >= 500 and < 1000', () => {
      render(<SpicyMeter score={500} />);

      expect(screen.getByText('Warm')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Warm (2 of 5 chilis)'
      );
    });

    it('shows "Mild" with 1 chili for scores >= 100 and < 500', () => {
      render(<SpicyMeter score={100} />);

      expect(screen.getByText('Mild')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Mild (1 of 5 chilis)'
      );
    });

    it('shows "Cool" with 1 chili for scores < 100', () => {
      render(<SpicyMeter score={50} />);

      expect(screen.getByText('Cool')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Spiciness: Cool (1 of 5 chilis)'
      );
    });
  });

  describe('Boundary Values', () => {
    it('shows "Hot" at exactly 1000', () => {
      render(<SpicyMeter score={1000} />);
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('shows "Warm" at 999', () => {
      render(<SpicyMeter score={999} />);
      expect(screen.getByText('Warm')).toBeInTheDocument();
    });

    it('shows "Blazing" at exactly 5000', () => {
      render(<SpicyMeter score={5000} />);
      expect(screen.getByText('Blazing')).toBeInTheDocument();
    });

    it('shows "Hot" at 4999', () => {
      render(<SpicyMeter score={4999} />);
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('shows "Legendary" at exactly 10000', () => {
      render(<SpicyMeter score={10000} />);
      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('shows "Blazing" at 9999', () => {
      render(<SpicyMeter score={9999} />);
      expect(screen.getByText('Blazing')).toBeInTheDocument();
    });

    it('shows "Warm" at exactly 500', () => {
      render(<SpicyMeter score={500} />);
      expect(screen.getByText('Warm')).toBeInTheDocument();
    });

    it('shows "Mild" at 499', () => {
      render(<SpicyMeter score={499} />);
      expect(screen.getByText('Mild')).toBeInTheDocument();
    });

    it('shows "Mild" at exactly 100', () => {
      render(<SpicyMeter score={100} />);
      expect(screen.getByText('Mild')).toBeInTheDocument();
    });

    it('shows "Cool" at 99', () => {
      render(<SpicyMeter score={99} />);
      expect(screen.getByText('Cool')).toBeInTheDocument();
    });
  });

  describe('Chili Rendering', () => {
    // Helper to count active/inactive chilis by filtering class list
    const countChilisByState = (container) => {
      const allChilis = container.querySelectorAll('[class*="chilis"] > span');
      let activeCount = 0;
      let inactiveCount = 0;

      allChilis.forEach((chili) => {
        const classList = chili.className;
        if (classList.includes('inactive')) {
          inactiveCount++;
        } else if (classList.includes('active')) {
          activeCount++;
        }
      });

      return { activeCount, inactiveCount, totalCount: allChilis.length };
    };

    it('renders 5 chili icons', () => {
      const { container } = render(<SpicyMeter score={10000} />);

      const { totalCount } = countChilisByState(container);
      expect(totalCount).toBe(5);
    });

    it('marks correct number of chilis as active for Legendary (5)', () => {
      const { container } = render(<SpicyMeter score={10000} />);

      const { activeCount, inactiveCount } = countChilisByState(container);

      expect(activeCount).toBe(5);
      expect(inactiveCount).toBe(0);
    });

    it('marks correct number of chilis as active for Blazing (4)', () => {
      const { container } = render(<SpicyMeter score={5000} />);

      const { activeCount, inactiveCount } = countChilisByState(container);

      expect(activeCount).toBe(4);
      expect(inactiveCount).toBe(1);
    });

    it('marks correct number of chilis as active for Hot (3)', () => {
      const { container } = render(<SpicyMeter score={1000} />);

      const { activeCount, inactiveCount } = countChilisByState(container);

      expect(activeCount).toBe(3);
      expect(inactiveCount).toBe(2);
    });

    it('marks correct number of chilis as active for Cool (1)', () => {
      const { container } = render(<SpicyMeter score={10} />);

      const { activeCount, inactiveCount } = countChilisByState(container);

      expect(activeCount).toBe(1);
      expect(inactiveCount).toBe(4);
    });
  });

  describe('Accessibility', () => {
    it('has role="img" for semantic meaning', () => {
      render(<SpicyMeter score={1000} />);

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      render(<SpicyMeter score={5000} />);

      const meter = screen.getByRole('img');
      expect(meter).toHaveAttribute(
        'aria-label',
        'Spiciness: Blazing (4 of 5 chilis)'
      );
    });

    it('hides decorative chilis from screen readers', () => {
      const { container } = render(<SpicyMeter score={1000} />);

      const chilisContainer = container.querySelector('[class*="chilis"]');
      expect(chilisContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('visible text label is present for all users', () => {
      render(<SpicyMeter score={2000} />);

      expect(screen.getByText('Hot')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero score', () => {
      render(<SpicyMeter score={0} />);

      expect(screen.getByText('Cool')).toBeInTheDocument();
    });

    it('handles negative score', () => {
      render(<SpicyMeter score={-100} />);

      expect(screen.getByText('Cool')).toBeInTheDocument();
    });

    it('handles very large scores', () => {
      render(<SpicyMeter score={1000000} />);

      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders main container with spicyMeter class', () => {
      const { container } = render(<SpicyMeter score={1000} />);

      expect(container.querySelector('[class*="spicyMeter"]')).toBeInTheDocument();
    });

    it('renders chilis container', () => {
      const { container } = render(<SpicyMeter score={1000} />);

      expect(container.querySelector('[class*="chilis"]')).toBeInTheDocument();
    });

    it('renders spicy text label', () => {
      const { container } = render(<SpicyMeter score={1000} />);

      expect(container.querySelector('[class*="spicyText"]')).toBeInTheDocument();
    });
  });
});
