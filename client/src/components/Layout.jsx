import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Chatbot from './Chatbot.jsx';

const LINKS = [
  ['Home', '/', true], ['Properties', '/properties'], ['Gallery', '/gallery'],
  ['Map', '/map'], ['About Us', '/about'], ['Contact Us', '/contact'],
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 12);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const cls = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  return (
    <header className={`nav ${solid || pathname !== '/' ? 'solid' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="Shailesh.dev home">
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-7h5v7" />
            </svg>
          </span>
          <span className="logo-text">Shailesh<em>.dev</em></span>
        </Link>
        <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><i /><i /><i /></button>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          {LINKS.map(([label, to, end]) => <NavLink key={to} to={to} end={end} className={cls}>{label}</NavLink>)}
          <Link className="btn btn-orange nav-mobile-cta" to="/contact" onClick={() => setOpen(false)}>Book a Visit</Link>
        </nav>
        <Link className="btn btn-orange btn-sm nav-cta" to="/contact">Book a Visit</Link>
      </div>
    </header>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  useEffect(() => { window.scrollTo(0, 0); document.title = 'Shailesh.dev — Find a Place That Feels Like Home'; }, [pathname]);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main id="main" key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {pathname !== '/map' && (
        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-col footer-about">
              <p className="footer-brand">Shailesh<span>.dev</span></p>
              <p>Verified homes, land and commercial spaces across Nagpur — with honest advice from first visit to final keys.</p>
            </div>
            <nav className="footer-col" aria-label="Footer">
              <p className="footer-head">Explore</p>
              <div className="footer-links">
                <Link to="/properties">All properties</Link>
                <Link to="/properties?category=Residential">Residential</Link>
                <Link to="/properties?category=Commercial">Commercial</Link>
                <Link to="/gallery">Gallery</Link>
                <Link to="/map">Property map</Link>
                <Link to="/about">About us</Link>
                <Link to="/contact">Contact us</Link>
              </div>
            </nav>
            <div className="footer-col">
              <p className="footer-head">Visit us</p>
              <p>12 Civil Lines, Nagpur 440001</p>
              <p><a href="tel:+919876543210">+91 98765 43210</a></p>
              <p><a href="mailto:hello@shailesh.dev">hello@shailesh.dev</a></p>
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} Shailesh.dev. All rights reserved.</p>
          </div>
        </footer>
      )}
      <Chatbot />
    </>
  );
}
