import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PropertyCard from '../components/PropertyCard.jsx';
import Properties from '../pages/Properties.jsx';
import Contact from '../pages/Contact.jsx';
import Layout from '../components/Layout.jsx';

const P = [
  { id: 'lakeview-villa', name: 'Lakeview Villa', location: 'Seminary Hills', city: 'Nagpur', category: 'Residential', type: 'Villa', price: 32e6, short: 'Four-bedroom villa.', images: [] },
  { id: 'orange-city-apartment', name: 'Orange City Apartment', location: 'Dharampeth', city: 'Nagpur', category: 'Residential', type: 'Apartment', price: 85e5, images: [] },
  { id: 'wardha-road-showroom', name: 'Wardha Road Showroom', location: 'Wardha Road', city: 'Nagpur', category: 'Commercial', type: 'Commercial', price: 45e6, images: [] },
];
const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
const wrap = (ui, url = '/') => render(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);

test('PropertyCard shows name, location, formatted price and a details link', () => {
  wrap(<PropertyCard property={P[0]} />);
  expect(screen.getByText('Lakeview Villa')).toBeInTheDocument();
  expect(screen.getByText('Seminary Hills, Nagpur')).toBeInTheDocument();
  expect(screen.getByText('₹3.2 Cr')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /view details of lakeview villa/i })).toHaveAttribute('href', '/properties/lakeview-villa');
});

test('Properties: search, chips and sorting filter the list', async () => {
  vi.stubGlobal('fetch', vi.fn(() => json(P)));
  const user = userEvent.setup();
  wrap(<Properties />, '/properties');
  await screen.findByText('Lakeview Villa');
  // default sort is price low to high
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Orange City Apartment', 'Lakeview Villa', 'Wardha Road Showroom']);
  await user.click(screen.getByRole('button', { name: 'Commercial' }));
  expect(screen.queryByText('Lakeview Villa')).not.toBeInTheDocument();
  expect(screen.getByText('Wardha Road Showroom')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'All' }));
  await user.type(screen.getByLabelText('Search properties'), 'dharam');
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  await user.clear(screen.getByLabelText('Search properties'));
  await user.selectOptions(screen.getByLabelText('Sort by'), 'price-desc');
  expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Wardha Road Showroom');
  await user.type(screen.getByLabelText('Search properties'), 'zzzz');
  expect(screen.getByText(/No properties match/)).toBeInTheDocument();
});

test('Properties: shows an error with retry when the API is down', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
  wrap(<Properties />, '/properties');
  expect(await screen.findByRole('alert')).toHaveTextContent(/cannot reach the server/i);
  expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
});

test('Contact: blocks invalid input with field errors, no network call', async () => {
  const f = vi.fn(); vi.stubGlobal('fetch', f);
  const user = userEvent.setup();
  wrap(<Contact />, '/contact');
  await user.type(screen.getByLabelText('Email address'), 'bad@');
  await user.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  expect(f).not.toHaveBeenCalled();
});

test('Contact: valid submit posts to the API and shows success', async () => {
  const f = vi.fn(() => json({ ok: true }, 201)); vi.stubGlobal('fetch', f);
  const user = userEvent.setup();
  wrap(<Contact />, '/contact?subject=Enquiry%3A%20Lakeview%20Villa');
  expect(screen.getByLabelText('Subject')).toHaveValue('Enquiry: Lakeview Villa');
  await user.type(screen.getByLabelText('Full name'), 'Asha Rao');
  await user.type(screen.getByLabelText('Email address'), 'asha@example.com');
  await user.type(screen.getByLabelText('Phone number'), '9876543210');
  await user.type(screen.getByLabelText('Message'), 'I would like to visit on Sunday.');
  await user.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByRole('status')).toHaveTextContent(/message sent/i);
  expect(f.mock.calls[0][0]).toBe('/api/contact');
  expect(JSON.parse(f.mock.calls[0][1].body).email).toBe('asha@example.com');
});

test('Contact: shows a server error message', async () => {
  vi.stubGlobal('fetch', vi.fn(() => json({ error: 'Too many messages. Try again in a minute.' }, 429)));
  const user = userEvent.setup();
  wrap(<Contact />, '/contact');
  await user.type(screen.getByLabelText('Full name'), 'Asha Rao');
  await user.type(screen.getByLabelText('Email address'), 'asha@example.com');
  await user.type(screen.getByLabelText('Phone number'), '9876543210');
  await user.type(screen.getByLabelText('Subject'), 'Visit');
  await user.type(screen.getByLabelText('Message'), 'I would like to visit on Sunday.');
  await user.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByText(/too many messages/i)).toBeInTheDocument();
});

test('Navbar: primary links point at their pages', () => {
  wrap(<Layout />);
  const nav = within(screen.getByRole('navigation', { name: 'Main' }));
  expect(nav.getByRole('link', { name: 'Properties' })).toHaveAttribute('href', '/properties');
  expect(nav.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery');
  expect(nav.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
  expect(nav.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
  expect(nav.getByRole('link', { name: 'Book a Visit' })).toHaveAttribute('href', '/contact');
});

describe('Hero video states', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.useRealTimers(); });
  const loadHero = async (video) => {
    vi.resetModules(); vi.stubEnv('VITE_HERO_VIDEO', video);
    return (await import('../components/Hero.jsx')).default;
  };

  test('no video configured: text and CTAs show immediately', async () => {
    const Hero = await loadHero('');
    wrap(<Hero />);
    expect(screen.getByRole('heading', { name: 'Find a Place That Feels Like Home.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore Properties' })).toHaveAttribute('href', '/properties');
    expect(screen.getByRole('link', { name: 'Book a Visit' })).toHaveAttribute('href', '/contact');
  });

  test('loading screen -> video plays -> text appears only after it ends', async () => {
    const Hero = await loadHero('/walk.mp4');
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    const { container } = wrap(<Hero />);
    expect(screen.getByRole('status')).toHaveTextContent(/preparing/i);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    const video = container.querySelector('video');
    await act(async () => { fireEvent.canPlay(video); });
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    await act(async () => { fireEvent.ended(video); });
    expect(screen.getByRole('heading', { name: /find a place/i })).toBeInTheDocument();
  });

  test('video error falls back instead of waiting forever', async () => {
    const Hero = await loadHero('/missing.mp4');
    const { container } = wrap(<Hero />);
    await act(async () => { fireEvent.error(container.querySelector('video')); });
    expect(screen.getByRole('heading', { name: /find a place/i })).toBeInTheDocument();
  });

  test('video that never loads times out to the fallback', async () => {
    const Hero = await loadHero('/slow.mp4');
    vi.useFakeTimers();
    wrap(<Hero />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(8100); });
    expect(screen.getByRole('heading', { name: /find a place/i })).toBeInTheDocument();
  });

  test('autoplay rejection falls back', async () => {
    const Hero = await loadHero('/walk.mp4');
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.reject(new Error('blocked')));
    const { container } = wrap(<Hero />);
    await act(async () => { fireEvent.canPlay(container.querySelector('video')); });
    expect(screen.getByRole('heading', { name: /find a place/i })).toBeInTheDocument();
  });
});
