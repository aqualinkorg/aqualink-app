import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Routes>
        <Route path="/sites" element={<div>Sites List</div>} />
        <Route path="/sites/1" element={<div>Sites</div>} />
      </Routes>
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
