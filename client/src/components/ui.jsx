import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';

const ICONS = {
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  home: <><path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-7h5v7" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /><path d="M10 21v-3h4v3" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9" /><path d="m16 4 3 3" /><path d="m13.5 6.5 3 3" /></>,
  shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  pin: <><path d="M20 10c0 5.2-8 12-8 12s-8-6.8-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></>,
  bed: <><path d="M3 18v-8m0 4h18v4m0-4v-2a2 2 0 0 0-2-2H9v4" /><path d="M6.5 10.5a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z" /></>,
  bath: <><path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" /><path d="M6 12V6.5A2.5 2.5 0 0 1 11 6" /><path d="M7 20l-1 1.5M17 20l1 1.5" /></>,
  area: <><path d="M4 4v16h16" /><path d="M8 16V8h8" /><path d="M8 12h4V8" /></>,
  phone: <><path d="M6.6 3.5 9.5 4l1.2 4-2 1.5a15 15 0 0 0 5.8 5.8l1.5-2 4 1.2.5 2.9a2 2 0 0 1-2.2 2.3C11 19.2 4.8 13 3.5 5.7a2 2 0 0 1 2.3-2.2Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  heart: <path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5L12 20.3Z" />,
  spark: <><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="m18.4 5.6-2.8 2.8" /><path d="m8.4 15.6-2.8 2.8" /></>,
  check: <path d="m5 12 4 4 10-10" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  pause: <><path d="M8 5v14" /><path d="M16 5v14" /></>,
  expand: <><path d="M9 4H4v5" /><path d="M15 4h5v5" /><path d="M9 20H4v-5" /><path d="M15 20h5v-5" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  list: <><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  filter: <><path d="M4 5h16" /><path d="M7 12h10" /><path d="M10 19h4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
};

export function Icon({ name, size = 20, strokeWidth = 1.8, fill = 'none', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {ICONS[name]}
    </svg>
  );
}

export function Reveal({ children, delay = 0, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/** Number that counts up when it scrolls into view (used for company stats). */
export function Counter({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return setN(to);
    let raf; const t0 = performance.now();
    const tick = (t) => { const k = Math.min((t - t0) / 1200, 1); setN(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref}>{n.toLocaleString('en-IN')}+</span>;
}

export function PageHeader({ title, children }) {
  const words = title.split(' ');
  const last = words.pop();
  return (
    <header className="page-header">
      <div className="page-header-bg" aria-hidden="true" />
      <div className="container page-header-inner">
        <span className="eyebrow">Shailesh.dev</span>
        <h1>{words.length > 0 ? <>{words.join(' ')} <span className="accent">{last}</span></> : <span className="accent">{last}</span>}</h1>
        {children && <p>{children}</p>}
      </div>
    </header>
  );
}

/** Image with progressive fade-in and a grey fallback so a broken URL never leaves a hole. */
export function Img({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current?.complete && ref.current?.naturalWidth) setLoaded(true); }, [src]);
  if (!src || failed) return <div className={`img-fallback ${className}`} role="img" aria-label={alt || 'Image unavailable'} />;
  return (
    <img ref={ref} src={src} alt={alt} className={`img-fade ${loaded ? 'is-loaded' : ''} ${className}`}
      loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} {...rest} />
  );
}

export function Status({ loading, error, retry, empty, children, skeleton = 6 }) {
  if (loading) return <div className="skeleton-grid" aria-busy="true" aria-label="Loading">{Array.from({ length: skeleton }, (_, i) => <div key={i} className="skeleton" />)}</div>;
  if (error) return (
    <div className="notice error" role="alert">
      <p>{error.message}</p>
      {retry && <button className="btn btn-dark" onClick={retry}>Try again</button>}
    </div>
  );
  if (empty) return <div className="notice"><p>{empty}</p></div>;
  return children;
}

/** Full-screen media lightbox shared by the gallery and property pages. Keyboard: Esc, ←, →. */
export function Lightbox({ items, index, onClose, onMove }) {
  const item = items[index];
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const key = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onMove(1); if (e.key === 'ArrowLeft') onMove(-1); };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [onClose, onMove]);
  return (
    <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={`${item.propertyName} ${item.type}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button ref={closeRef} className="lb-btn lb-close" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button>
      <button className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onMove(-1); }}>‹</button>
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? <video key={item.id} src={item.src} poster={item.poster} controls autoPlay playsInline /> : <Img key={item.id} src={item.src} alt={`${item.propertyName} photo`} loading="eager" />}
        <p>{item.propertyName} · {index + 1} / {items.length}</p>
      </div>
      <button className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); onMove(1); }}>›</button>
    </motion.div>
  );
}

/** Convenience wrapper: <AnimatePresence>{open !== null && <Lightbox … />}</AnimatePresence> */
export function LightboxHost({ items, index, onClose, onMove }) {
  return <AnimatePresence>{index !== null && items[index] && <Lightbox items={items} index={index} onClose={onClose} onMove={onMove} />}</AnimatePresence>;
}
