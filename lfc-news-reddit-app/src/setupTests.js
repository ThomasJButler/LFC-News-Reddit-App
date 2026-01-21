/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Jest test environment configuration with DOM testing utilities.
 *              WHY: ESM modules like react-markdown and react-syntax-highlighter
 *              require special handling in Jest. We mock them to avoid transformation
 *              issues while still allowing meaningful integration tests.
 */

import '@testing-library/jest-dom';

// Mock react-markdown to avoid ESM transformation issues
// WHY: react-markdown and its dependencies use ESM exports which Jest cannot
// handle without complex transformation configuration. Mocking allows tests to run.
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown">{children}</div>;
});

// Mock remark-gfm plugin
jest.mock('remark-gfm', () => () => {});

// Mock react-syntax-highlighter to avoid refractor module issues
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre data-testid="syntax-highlighter">{children}</pre>,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));
