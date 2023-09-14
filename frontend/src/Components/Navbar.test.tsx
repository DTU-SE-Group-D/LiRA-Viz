import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter as Router } from 'react-router-dom';

function TestRouter() {
  return (
    <Router>
      <Navbar />
    </Router>
  );
}
test('Check links in navbar', () => {
  render(<TestRouter />);
  const linkConditionsML = screen.getByText(/Conditions \(ML\)/i);
  expect(linkConditionsML).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Conditions \(ML\)/i }),
  ).toHaveAttribute('href', '/conditions');

  const linkConditionsGP = screen.getByText(/Conditions \(GP\)/i);
  expect(linkConditionsGP).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Conditions \(GP\)/i }),
  ).toHaveAttribute('href', '/road_conditions');
});
