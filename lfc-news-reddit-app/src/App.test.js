/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Basic smoke tests for App component rendering.
 */

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
