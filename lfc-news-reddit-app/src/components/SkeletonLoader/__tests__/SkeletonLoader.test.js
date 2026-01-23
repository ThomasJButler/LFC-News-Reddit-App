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
import PostListSkeleton, {
  CommentsSkeleton,
  HeaderSkeleton,
  SubredditFilterSkeleton,
  PostDetailSkeleton,
  SearchResultsSkeleton
} from '../SkeletonLoader';

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

describe('HeaderSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders header skeleton container', () => {
      const { container } = render(<HeaderSkeleton />);

      const headerContainer = container.querySelector('[class*="headerSkeletonContainer"]');
      expect(headerContainer).toBeInTheDocument();
    });

    it('renders logo placeholder', () => {
      const { container } = render(<HeaderSkeleton />);

      const logo = container.querySelector('[class*="headerLogo"]');
      expect(logo).toBeInTheDocument();
    });

    it('renders subtitle placeholder', () => {
      const { container } = render(<HeaderSkeleton />);

      const subtitle = container.querySelector('[class*="headerSubtitle"]');
      expect(subtitle).toBeInTheDocument();
    });

    it('renders tagline placeholder', () => {
      const { container } = render(<HeaderSkeleton />);

      const tagline = container.querySelector('[class*="headerTagline"]');
      expect(tagline).toBeInTheDocument();
    });

    it('renders search bar placeholder', () => {
      const { container } = render(<HeaderSkeleton />);

      const searchBar = container.querySelector('[class*="headerSearchBar"]');
      expect(searchBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<HeaderSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<HeaderSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing the loading state', () => {
      render(<HeaderSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading header');
    });

    it('has screen reader only text', () => {
      render(<HeaderSkeleton />);

      const srText = screen.getByText('Loading header, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });
});

describe('SubredditFilterSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders filter skeleton container', () => {
      const { container } = render(<SubredditFilterSkeleton />);

      const filterContainer = container.querySelector('[class*="filterSkeletonContainer"]');
      expect(filterContainer).toBeInTheDocument();
    });

    it('renders sort section', () => {
      const { container } = render(<SubredditFilterSkeleton />);

      const sortSection = container.querySelector('[class*="filterSkeletonSortSection"]');
      expect(sortSection).toBeInTheDocument();
    });

    it('renders filter label', () => {
      const { container } = render(<SubredditFilterSkeleton />);

      const label = container.querySelector('[class*="filterLabel"]');
      expect(label).toBeInTheDocument();
    });

    it('renders filter select placeholder', () => {
      const { container } = render(<SubredditFilterSkeleton />);

      const select = container.querySelector('[class*="filterSelect"]');
      expect(select).toBeInTheDocument();
    });

    it('renders multiple filter buttons', () => {
      const { container } = render(<SubredditFilterSkeleton />);

      const buttons = container.querySelectorAll('[class*="filterButton"]');
      expect(buttons.length).toBe(4);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<SubredditFilterSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<SubredditFilterSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing the loading state', () => {
      render(<SubredditFilterSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading filters');
    });

    it('has screen reader only text', () => {
      render(<SubredditFilterSkeleton />);

      const srText = screen.getByText('Loading filters, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });
});

describe('PostDetailSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders post detail skeleton container', () => {
      const { container } = render(<PostDetailSkeleton />);

      const detailContainer = container.querySelector('[class*="postDetailSkeletonContainer"]');
      expect(detailContainer).toBeInTheDocument();
    });

    it('renders post header with subreddit, author, and time placeholders', () => {
      const { container } = render(<PostDetailSkeleton />);

      const subreddit = container.querySelector('[class*="postDetailSubreddit"]');
      expect(subreddit).toBeInTheDocument();

      const author = container.querySelector('[class*="postDetailAuthor"]');
      expect(author).toBeInTheDocument();

      const time = container.querySelector('[class*="postDetailTime"]');
      expect(time).toBeInTheDocument();
    });

    it('renders title placeholders', () => {
      const { container } = render(<PostDetailSkeleton />);

      const title = container.querySelector('[class*="postDetailTitle"]');
      expect(title).toBeInTheDocument();

      const titleSecond = container.querySelector('[class*="postDetailTitleSecond"]');
      expect(titleSecond).toBeInTheDocument();
    });

    it('renders media placeholder by default', () => {
      const { container } = render(<PostDetailSkeleton />);

      const media = container.querySelector('[class*="postDetailMedia"]');
      expect(media).toBeInTheDocument();
    });

    it('does not render media placeholder when showMedia is false', () => {
      const { container } = render(<PostDetailSkeleton showMedia={false} />);

      const media = container.querySelector('[class*="postDetailMedia"]');
      expect(media).not.toBeInTheDocument();
    });

    it('renders content lines', () => {
      const { container } = render(<PostDetailSkeleton />);

      const contentLines = container.querySelectorAll('[class*="postDetailContentLine"]');
      expect(contentLines.length).toBe(4);
    });

    it('renders stats section with action placeholders', () => {
      const { container } = render(<PostDetailSkeleton />);

      const stats = container.querySelector('[class*="postDetailStats"]');
      expect(stats).toBeInTheDocument();

      const actions = container.querySelectorAll('[class*="postDetailAction"]');
      expect(actions.length).toBe(2);
    });

    it('renders comments skeleton', () => {
      const { container } = render(<PostDetailSkeleton />);

      // CommentsSkeleton renders inside PostDetailSkeleton
      const commentSkeletons = container.querySelectorAll('[class*="commentSkeleton"]');
      expect(commentSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<PostDetailSkeleton />);

      // Multiple status regions (PostDetailSkeleton + CommentsSkeleton inside)
      const containers = screen.getAllByRole('status');
      expect(containers.length).toBeGreaterThanOrEqual(1);
    });

    it('has aria-label describing the loading state', () => {
      render(<PostDetailSkeleton />);

      const containers = screen.getAllByRole('status');
      const postDetailContainer = containers.find(
        c => c.getAttribute('aria-label') === 'Loading post details'
      );
      expect(postDetailContainer).toBeInTheDocument();
    });

    it('has screen reader only text', () => {
      render(<PostDetailSkeleton />);

      const srText = screen.getByText('Loading post details, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });
});

describe('SearchResultsSkeleton Component', () => {
  describe('Rendering', () => {
    it('renders search results skeleton container', () => {
      const { container } = render(<SearchResultsSkeleton />);

      const searchContainer = container.querySelector('[class*="searchResultsSkeletonContainer"]');
      expect(searchContainer).toBeInTheDocument();
    });

    it('renders search context indicator', () => {
      const { container } = render(<SearchResultsSkeleton />);

      const context = container.querySelector('[class*="searchContext"]');
      expect(context).toBeInTheDocument();
    });

    it('renders search context icon', () => {
      const { container } = render(<SearchResultsSkeleton />);

      const icon = container.querySelector('[class*="searchContextIcon"]');
      expect(icon).toBeInTheDocument();
    });

    it('renders search context text', () => {
      const { container } = render(<SearchResultsSkeleton />);

      const text = container.querySelector('[class*="searchContextText"]');
      expect(text).toBeInTheDocument();
    });

    it('renders correct number of post list skeleton cards (default 5)', () => {
      const { container } = render(<SearchResultsSkeleton />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(5);
    });

    it('renders specified number of post list skeleton cards', () => {
      const { container } = render(<SearchResultsSkeleton count={3} />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<SearchResultsSkeleton />);

      // Multiple status regions (SearchResultsSkeleton + PostListSkeleton inside)
      const containers = screen.getAllByRole('status');
      expect(containers.length).toBeGreaterThanOrEqual(1);
    });

    it('has aria-label describing the loading state', () => {
      render(<SearchResultsSkeleton />);

      const containers = screen.getAllByRole('status');
      const searchContainer = containers.find(
        c => c.getAttribute('aria-label') === 'Loading search results'
      );
      expect(searchContainer).toBeInTheDocument();
    });

    it('has screen reader only text', () => {
      render(<SearchResultsSkeleton />);

      const srText = screen.getByText('Loading search results, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('Edge Cases', () => {
    it('renders zero result cards when count is 0', () => {
      const { container } = render(<SearchResultsSkeleton count={0} />);

      const skeletonCards = container.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletonCards.length).toBe(0);
    });
  });
});
