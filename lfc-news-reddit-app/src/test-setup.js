/**
 * @author Tom Butler
 * @date 2026-02-11
 * @description Vitest test environment configuration with DOM testing utilities.
 *              WHY: ESM modules like react-markdown and react-syntax-highlighter
 *              need mocking to avoid transformation issues in the test environment.
 *              Vitest handles most ESM natively, but these modules have complex
 *              dependency chains that benefit from being mocked for unit test speed.
 */

import '@testing-library/jest-dom';

// Mock react-markdown — renders children as a simple div for testing
vi.mock('react-markdown', () => ({
  default: ({ children }) => <div data-testid="markdown">{children}</div>,
}));

// Mock remark-gfm plugin — no-op in tests
vi.mock('remark-gfm', () => ({
  default: () => {},
}));

// Mock react-syntax-highlighter — renders code as a pre block for testing
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre data-testid="syntax-highlighter">{children}</pre>,
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));
