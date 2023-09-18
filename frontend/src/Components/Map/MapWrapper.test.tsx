import { render, screen } from '@testing-library/react';
import MapWrapper from './MapWrapper';

test('Check subcomponent of mapwrapper', () => {
  render(<MapWrapper />);

  const names = ['MapContainer', 'TileLayer', 'ScaleControl', 'ZoomControl'];

  for (let idx in names) {
    const element = screen.getByText(names[idx]);
    expect(element).toBeInTheDocument();
  }
});
