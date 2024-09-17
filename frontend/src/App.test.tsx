import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders text', () => {
  render(<App />);
  const el = screen.getByText(/TypeScript \+ Styled Components/i);
  expect(el).toBeInTheDocument();
});
