/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for SkeletonLoader components (PostListSkeleton and CommentsSkeleton).
 *              WHY: Skeleton loaders provide crucial UX feedback during loading states.
 *              These tests verify correct rendering, accessibility attributes, and
 *              proper structure that matches actual content layouts to prevent layout shift.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PostListSkeleton, { CommentsSkeleton } from '../SkeletonLoader';

describe('PostListSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders correct number of skeleton cards (default 5)', () => {
      const { container } = render(<PostListSkeleton />);

      // Each skeleton card has a skeletonCard class
      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(5);
    });

    it('renders specified number of skeleton cards', () => {
      const { container } = render(<PostListSkeleton count={3} />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(3);
    });

    it('renders vote section in each card', () => {
      const { container } = render(<PostListSkeleton count={1} />);

      const voteSection = container.querySelector('[class*="voteSection"]');
      expect(voteSection).toBeInTheDocument();
    });

    it('renders content section with header and title', () => {
      const { container } = render(<PostListSkeleton count={1} />);

      const contentSection = container.querySelector('[class*="contentSection"]');
      expect(contentSection).toBeInTheDocument();

      const postHeader = container.querySelector('[class*="postHeader"]');
      expect(postHeader).toBeInTheDocument();

      const title = container.querySelector('[class*="skeletonTitle"]');
      expect(title).toBeInTheDocument();
    });

    it('renders thumbnail section', () => {
      const { container } = render(<PostListSkeleton count={1} />);

      const thumbnailSection = container.querySelector('[class*="thumbnailSection"]');
      expect(thumbnailSection).toBeInTheDocument();
    });

    it('renders post footer with multiple items', () => {
      const { container } = render(<PostListSkeleton count={1} />);

      const footerItems = container.querySelectorAll('[class*="skeletonFooterItem"]');
      expect(footerItems.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<PostListSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<PostListSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing the loading state', () => {
      render(<PostListSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading posts');
    });

    it('has screen reader only text', () => {
      render(<PostListSkeleton />);

      const srText = screen.getByText('Loading posts, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Edge Cases', () => {
    it('renders zero cards when count is 0', () => {
      const { container } = render(<PostListSkeleton count={0} />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(0);
    });

    it('handles large count values', () => {
      const { container } = render(<PostListSkeleton count={100} />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(100);
    });
  });
});

describe('CommentsSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders correct number of skeleton comments (default 4)', () => {
      const { container } = render(<CommentsSkeleton />);

      // Each top-level comment is in a wrapper div
      const commentSkeletons = container.querySelectorAll('[class*="commentSkeleton"]');
      // 4 top-level + 2 nested (first 2 have nested) = 6 total
      expect(commentSkeletons.length).toBe(6);
    });

    it('renders specified number of skeleton comments', () => {
      const { container } = render(<CommentsSkeleton count={2} />);

      // 2 top-level + 2 nested = 4 total
      const commentSkeletons = container.querySelectorAll('[class*="commentSkeleton"]');
      expect(commentSkeletons.length).toBe(4);
    });

    it('renders comment header with avatar, author, and timestamp', () => {
      const { container } = render(<CommentsSkeleton count={1} />);

      const avatar = container.querySelector('[class*="commentAvatar"]');
      expect(avatar).toBeInTheDocument();

      const author = container.querySelector('[class*="commentAuthor"]');
      expect(author).toBeInTheDocument();

      const timestamp = container.querySelector('[class*="commentTimestamp"]');
      expect(timestamp).toBeInTheDocument();
    });

    it('renders comment body with multiple lines', () => {
      const { container } = render(<CommentsSkeleton count={1} />);

      const bodyLines = container.querySelectorAll('[class*="commentBodyLine"]');
      // First comment has 3 lines in main comment + 2 lines in nested = 5 total
      expect(bodyLines.length).toBeGreaterThanOrEqual(3);
    });

    it('renders nested comments only for first two items', () => {
      const { container } = render(<CommentsSkeleton count={4} />);

      const nestedComments = container.querySelectorAll('[class*="nestedComment"]');
      expect(nestedComments.length).toBe(2);
    });

    it('does not render nested comments for items after index 1', () => {
      const { container } = render(<CommentsSkeleton count={1} />);

      // First item (index 0) should have nested comment
      const nestedComments = container.querySelectorAll('[class*="nestedComment"]');
      expect(nestedComments.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<CommentsSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<CommentsSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing the loading state', () => {
      render(<CommentsSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading comments');
    });

    it('has screen reader only text', () => {
      render(<CommentsSkeleton />);

      const srText = screen.getByText('Loading comments, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Line Width Variations', () => {
    it('renders body lines with varying widths for visual interest', () => {
      const { container } = render(<CommentsSkeleton count={1} />);

      const bodyLines = container.querySelectorAll('[class*="commentBodyLine"]');

      // Check that at least one line has a specific width style
      const lineWidths = Array.from(bodyLines).map(line => line.style.width);

      // Should include at least the widths from the first comment
      expect(lineWidths).toContain('95%');
      expect(lineWidths).toContain('88%');
      expect(lineWidths).toContain('75%');
    });
  });

  describe('Edge Cases', () => {
    it('renders zero comments when count is 0', () => {
      const { container } = render(<CommentsSkeleton count={0} />);

      const commentSkeletons = container.querySelectorAll('[class*="commentSkeleton"]');
      expect(commentSkeletons.length).toBe(0);
    });
  });
});
