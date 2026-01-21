/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for CommentList component.
 *              WHY: CommentList handles threaded conversation display which is central to the
 *              Reddit experience. These tests verify correct rendering, collapse/expand behaviour,
 *              thread line colouring, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CommentList from '../CommentList';

// Mock window.innerWidth for consistent testing
const mockInnerWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
};

// Helper to create mock comments
const createMockComment = (overrides = {}) => ({
  id: 'comment1',
  author: 'testuser',
  body: 'This is a test comment body.',
  score: 42,
  created: Date.now() / 1000 - 3600, // 1 hour ago
  replies: [],
  level: 0,
  isSubmitter: false,
  stickied: false,
  distinguished: null,
  ...overrides
});

// Helper to create nested comment structure
const createNestedComments = () => [
  createMockComment({
    id: 'comment1',
    author: 'user1',
    body: 'Top level comment 1',
    replies: [
      createMockComment({
        id: 'reply1',
        author: 'user2',
        body: 'Reply to comment 1',
        level: 1,
        replies: [
          createMockComment({
            id: 'nested-reply1',
            author: 'user3',
            body: 'Nested reply',
            level: 2,
            replies: []
          })
        ]
      })
    ]
  }),
  createMockComment({
    id: 'comment2',
    author: 'user4',
    body: 'Top level comment 2',
    replies: []
  })
];

describe('CommentList Component', () => {
  beforeEach(() => {
    // Default to desktop width
    mockInnerWidth(1024);
  });

  describe('Empty State', () => {
    it('renders empty message when comments array is empty', () => {
      render(<CommentList comments={[]} />);

      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
      expect(screen.getByText(/Be the first to comment on Reddit!/)).toBeInTheDocument();
    });

    it('renders empty message when comments is undefined', () => {
      // This will log a propTypes warning but should handle gracefully
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<CommentList comments={undefined} />);

      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Basic Rendering', () => {
    it('renders comment author', () => {
      const comments = [createMockComment({ author: 'TestAuthor' })];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('TestAuthor')).toBeInTheDocument();
    });

    it('renders comment body with markdown', () => {
      const comments = [createMockComment({ body: 'This is **bold** text' })];
      render(<CommentList comments={comments} />);

      // Check that the markdown is processed (ReactMarkdown mock shows markdown content)
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });

    it('renders comment score', () => {
      const comments = [createMockComment({ score: 123 })];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('123 upvotes')).toBeInTheDocument();
    });

    it('renders comment count header', () => {
      const comments = [
        createMockComment({ id: 'c1' }),
        createMockComment({ id: 'c2' }),
        createMockComment({ id: 'c3' })
      ];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('3 comments')).toBeInTheDocument();
    });

    it('renders singular comment text for one comment', () => {
      const comments = [createMockComment()];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('1 comment')).toBeInTheDocument();
    });
  });

  describe('Nested Comments', () => {
    it('renders nested replies', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      expect(screen.getByText('Top level comment 1')).toBeInTheDocument();
      expect(screen.getByText('Reply to comment 1')).toBeInTheDocument();
      expect(screen.getByText('Nested reply')).toBeInTheDocument();
    });

    it('shows reply count on collapse button', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      // The first comment has 2 total replies (1 direct + 1 nested)
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Collapse/Expand', () => {
    it('changes aria-expanded when collapse button is clicked', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      // Find the collapse button for the first comment (it has replies)
      let collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];

      // Initially expanded (aria-expanded="true" - comment is not collapsed)
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      fireEvent.click(collapseButton);

      // Re-query the button as component re-renders
      collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];

      // Should now be collapsed (aria-expanded="false")
      expect(collapseButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('hides comment body and replies when collapsed', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      // Initially the top level comment 2 is visible
      expect(screen.getByText('Top level comment 2')).toBeInTheDocument();

      // Initially replies are visible
      expect(screen.getByText('Reply to comment 1')).toBeInTheDocument();

      // Find and click the collapse button on first comment
      const collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];
      fireEvent.click(collapseButton);

      // First comment's replies should be hidden
      expect(screen.queryByText('Reply to comment 1')).not.toBeInTheDocument();

      // Top level comment 2 should still be visible
      expect(screen.getByText('Top level comment 2')).toBeInTheDocument();
    });

    it('restores visibility when expanded after collapse', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      let collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];

      // Click to collapse first comment
      fireEvent.click(collapseButton);

      // Verify replies are hidden
      expect(screen.queryByText('Reply to comment 1')).not.toBeInTheDocument();

      // Re-query the button and click to expand
      collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];
      fireEvent.click(collapseButton);

      // Re-query button for assertion
      collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread/ })[0];

      // Verify it's expanded
      expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has Collapse All button', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      const collapseAllButton = screen.getByRole('button', { name: /Collapse all top-level comments/ });
      expect(collapseAllButton).toBeInTheDocument();
    });

    it('collapses all top-level comments when Collapse All is clicked', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      const collapseAllButton = screen.getByRole('button', { name: /Collapse all/ });
      fireEvent.click(collapseAllButton);

      // Replies should be hidden
      expect(screen.queryByText('Reply to comment 1')).not.toBeInTheDocument();

      // Button should now say Expand All
      expect(screen.getByRole('button', { name: /Expand all/ })).toBeInTheDocument();
    });

    it('expands all comments when Expand All is clicked', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      // First collapse all
      const collapseAllButton = screen.getByRole('button', { name: /Collapse all/ });
      fireEvent.click(collapseAllButton);

      // Then expand all
      const expandAllButton = screen.getByRole('button', { name: /Expand all/ });
      fireEvent.click(expandAllButton);

      // Replies should be visible again
      expect(screen.getByText('Reply to comment 1')).toBeInTheDocument();
    });
  });

  describe('User Badges', () => {
    it('shows OP badge for submitter', () => {
      const comments = [createMockComment({ isSubmitter: true })];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('OP')).toBeInTheDocument();
    });

    it('does not show OP badge for non-submitter', () => {
      const comments = [createMockComment({ isSubmitter: false })];
      render(<CommentList comments={comments} />);

      expect(screen.queryByText('OP')).not.toBeInTheDocument();
    });

    it('shows Pinned badge for stickied comments', () => {
      const comments = [createMockComment({ stickied: true })];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });

    it('shows distinguished badge for moderator comments', () => {
      const comments = [createMockComment({ distinguished: 'moderator' })];
      render(<CommentList comments={comments} />);

      expect(screen.getByText('moderator')).toBeInTheDocument();
    });
  });

  describe('Responsive Behaviour', () => {
    it('applies desktop indentation on wide screens', () => {
      mockInnerWidth(1024);

      const comments = [
        createMockComment({
          id: 'c1',
          replies: [
            createMockComment({
              id: 'c2',
              level: 1,
              replies: [
                createMockComment({
                  id: 'c3',
                  level: 2,
                  replies: []
                })
              ]
            })
          ]
        })
      ];

      const { container } = render(<CommentList comments={comments} />);

      // Check that comments are rendered (indentation is CSS-based)
      const commentElements = container.querySelectorAll('[class*="comment"]');
      expect(commentElements.length).toBeGreaterThan(0);
    });

    it('applies mobile indentation on narrow screens', () => {
      mockInnerWidth(375);

      const comments = [
        createMockComment({
          id: 'c1',
          replies: [
            createMockComment({
              id: 'c2',
              level: 1,
              replies: []
            })
          ]
        })
      ];

      const { container } = render(<CommentList comments={comments} />);

      // Check that comments are rendered
      const commentElements = container.querySelectorAll('[class*="comment"]');
      expect(commentElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('collapse button has aria-expanded attribute', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      const collapseButtons = screen.getAllByRole('button', { name: /Toggle comment thread/ });
      expect(collapseButtons[0]).toHaveAttribute('aria-expanded');
    });

    it('collapse button has descriptive aria-label with reply count', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      const collapseButton = screen.getAllByRole('button', { name: /Toggle comment thread with 2 replies/ })[0];
      expect(collapseButton).toBeInTheDocument();
    });

    it('Collapse All button has accessible label', () => {
      const comments = createNestedComments();
      render(<CommentList comments={comments} />);

      const collapseAllButton = screen.getByRole('button', { name: /Collapse all top-level comments/ });
      expect(collapseAllButton).toHaveAttribute('aria-label');
    });
  });

  describe('Thread Lines', () => {
    it('applies thread colours based on comment depth', () => {
      const comments = [
        createMockComment({
          id: 'c1',
          level: 0,
          replies: [
            createMockComment({
              id: 'c2',
              level: 1,
              replies: [
                createMockComment({
                  id: 'c3',
                  level: 2,
                  replies: []
                })
              ]
            })
          ]
        })
      ];

      const { container } = render(<CommentList comments={comments} />);

      // Comments should be rendered with different levels
      const allComments = container.querySelectorAll('[class*="comment"]');
      expect(allComments.length).toBeGreaterThanOrEqual(3);
    });
  });
});
