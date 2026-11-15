import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { formatPrice } from '@shared/format.js';
import { Icon, Img, LightboxHost, Reveal, Status } from '../components/ui.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { useFetch } from '../lib/useFetch.js';
import { setMeta } from '../lib/seo.js';

const DetailMap = lazy(() => import('../components/DetailMap.jsx'));

/**
 * Full-viewport cinematic property hero. The video (or an image slideshow fallback) plays
 * continuously behind the title, price and CTAs; a thin bar reflects real playback progress.
 */
function PropertyHero({ p }) {
  const reduce = useReducedMotion();
  const videoRef = useRef(null);
  const [broken, setBroken] = useState(false);
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const useVideo = !!p.video && !broken && !reduce;
  const images = p.images?.length ? p.images : [];

  useEffect(() => {
    if (useVideo || images.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [useVideo, images.length]);

  const enquiry = `/contact?subject=${encodeURIComponent(`Enquiry: ${p.name}`)}`;
  const visit = `/contact?subject=${encodeURIComponent(`Visit: ${p.name}`)}`;

  return (
    <section className="detail-hero" aria-label={`${p.name} presentation`}>
      <div className="dh-media" aria-hidden="true">
        {useVideo ? (
          <video ref={videoRef} className="dh-video" src={p.video} poster={images[0]} autoPlay muted loop playsInline preload="auto"
            onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
            onError={() => setBroken(true)} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.img key={slide} className="dh-video" src={images[slide]} alt="" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
          </AnimatePresence>
        )}
      </div>
      <div className="dh-scrim" aria-hidden="true" />

      <div className="container dh-content">
        <Link className="back-link" to="/properties"><Icon name="back" size={16} /> All properties</Link>
        <span className="eyebrow">{p.category} · {p.type}{p.featured ? ' · Featured' : ''}</span>
        <h1>{p.name}</h1>
        <div className="detail-meta">
          <span><Icon name="pin" size={14} /> {p.location}, {p.city}</span>
          {p.area > 0 && <span>{p.area.toLocaleString('en-IN')} sq ft</span>}
          <span className="detail-price-chip">{formatPrice(p.price)}</span>
        </div>
        {p.short && <p className="dh-desc">{p.short}</p>}
        <div className="dh-ctas">
          <Link className="btn btn-orange" to={enquiry}>Enquire Now <Icon name="arrow" size={17} /></Link>
          <Link className="btn btn-ghost" to={visit}><Icon name="calendar" size={16} /> Schedule a Visit</Link>
        </div>
      </div>
      {useVideo && <div className="dh-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>}
    </section>
  );
}

const row = (k, v) => v !== undefined && v !== null && v !== '' && v !== 'n/a' && <div className="kv" key={k}><span>{k}</span><strong>{v}</strong></div>;

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: p, error, loading, retry } = useFetch(`/properties/${id}`);
  const { data: all } = useFetch('/properties');
  const [open, setOpen] = useState(null);
  const a = p?.agent;

  const gallery = useMemo(() => {
    if (!p) return [];
    const items = (p.images || []).map((src, i) => ({ id: `${p.id}-img-${i}`, type: 'image', src, propertyName: p.name }));
    if (p.video) items.push({ id: `${p.id}-video`, type: 'video', src: p.video, poster: p.images?.[0], propertyName: p.name });
    return items;
  }, [p]);

  const related = useMemo(() => {
    if (!p || !all) return [];
    const others = all.filter((x) => x.id !== p.id && x.city === p.city);
    others.sort((x, y) => (y.type === p.type) - (x.type === p.type) || Math.abs(x.price - p.price) - Math.abs(y.price - p.price));
    return others.slice(0, 3);
  }, [p, all]);

  useEffect(() => { if (p) setMeta(`${p.name} · Shailesh.dev`, `${p.short || p.name} — ${p.location}, ${p.city}. ${formatPrice(p.price)}.`); }, [p]);

  const close = () => setOpen(null);
  const move = (d) => setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length));

  return (
    <>
      <Status loading={loading} skeleton={1} error={error && (error.status === 404 ? { message: 'We couldn’t find that property. It may have been sold.' } : error)} retry={error?.status === 404 ? undefined : retry}>
        {p && (
          <>
            <PropertyHero p={p} />

            <div className="container section">
              <div className="detail-grid">
                <div className="detail-main">
                  <p className="muted detail-address">{p.address}</p>
                  <p className="price big">{formatPrice(p.price)}</p>

                  <Reveal><h2>Photo gallery</h2>
                    <div className="detail-gallery">
                      <button className="dg-main" onClick={() => setOpen(0)} aria-label={`Open photo of ${p.name}`}>
                        <Img src={p.images?.[0]} alt={p.name} loading="eager" />
                      </button>
                      {gallery.slice(1).map((g, i) => (
                        <motion.button key={g.id} className="dg-thumb" onClick={() => setOpen(i + 1)} aria-label={`Open media ${i + 2} of ${p.name}`}
                          whileHover={{ scale: 1.02 }}>
                          {g.type === 'video' ? (
                            <span className="dg-video-thumb"><Img src={g.poster} alt="" /><span className="play sm"><Icon name="play" size={16} fill="currentColor" strokeWidth={0} /></span></span>
                          ) : <Img src={g.src} alt="" />}
                        </motion.button>
                      ))}
                    </div>
                    <p className="muted gallery-hint"><Icon name="expand" size={15} /> Click any image to open the full-screen viewer.</p>
                  </Reveal>

                  <Reveal><h2>Property overview</h2>
                    <div className="kv-grid">
                      {row('Type', p.type)}{row('Area', p.area && `${p.area.toLocaleString('en-IN')} sq ft`)}
                      {row('Bedrooms', p.bedrooms || undefined)}{row('Bathrooms', p.bathrooms || undefined)}
                      {row('Parking', p.parking)}{row('Furnishing', p.furnishing)}
                      {row('Year built', p.yearBuilt || undefined)}{row('Facing', p.facing)}
                      {row('Location', `${p.location}, ${p.city}`)}{row('Category', p.category)}
                    </div>
                  </Reveal>
                  {p.amenities?.length > 0 && <Reveal><h2>Amenities & features</h2><ul className="tags">{p.amenities.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>}
                  <Reveal><h2>About this property</h2><p className="prose">{p.description}</p></Reveal>
                  {p.construction && <Reveal><h2>Construction</h2><p className="prose">{p.construction}</p></Reveal>}
                  {p.features?.length > 0 && <Reveal><h2>Additional features</h2><ul className="tags">{p.features.map((x) => <li key={x}>{x}</li>)}</ul></Reveal>}

                  {p.coordinates && (
                    <Reveal><h2>Location</h2>
                      <div className="detail-map">
                        <Suspense fallback={<div className="detail-map-inner" />}>
                          <DetailMap property={p} />
                        </Suspense>
                      </div>
                    </Reveal>
                  )}

                  <Reveal>
                    <div className="feedback-empty">
                      <span className="icon-badge"><Icon name="star" size={22} /></span>
                      <div>
                        <h3>Buyer feedback</h3>
                        <p>Verified buyer reviews for this property will appear here as clients complete their purchases. Until then, our team is happy to answer any question directly.</p>
                      </div>
                      <Link className="btn btn-light" to={`/contact?subject=${encodeURIComponent(`Question: ${p.name}`)}`}>Ask us anything</Link>
                    </div>
                  </Reveal>
                </div>

                {a && (
                  <aside className="agent" aria-label="Property dealer">
                    <span className="eyebrow">Your agent</span>
                    <div className="avatar" aria-hidden="true">{a.name[0]}</div>
                    <h3>{a.name}</h3>
                    <p className="muted">{a.company}</p>
                    <p>{a.bio}</p>
                    <p className="agent-lines">
                      <a href={`tel:${a.phone.replace(/\s/g, '')}`}><Icon name="phone" size={16} /> {a.phone}</a><br />
                      <a href={`mailto:${a.email}`}><Icon name="mail" size={16} /> {a.email}</a><br />
                      <span><Icon name="pin" size={16} /> {a.office}</span>
                    </p>
                    <a className="btn btn-orange block" href={`tel:${a.phone.replace(/\s/g, '')}`}><Icon name="phone" size={16} /> Call Agent</a>
                    <a className="btn btn-dark block" href={`mailto:${a.email}?subject=${encodeURIComponent(`Enquiry: ${p.name}`)}`}><Icon name="mail" size={16} /> Email Agent</a>
                    <a className="btn btn-dark block" href={`https://wa.me/${a.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to ask about ${p.name}.`)}`} target="_blank" rel="noreferrer"><Icon name="spark" size={16} /> WhatsApp</a>
                    <Link className="btn btn-light block" to={`/contact?subject=${encodeURIComponent(`Visit: ${p.name}`)}`}><Icon name="calendar" size={16} /> Schedule a Visit</Link>
                  </aside>
                )}
              </div>
            </div>

            {related.length > 0 && (
              <section className="container section related-section">
                <Reveal>
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">Keep exploring</span>
                      <h2>Similar properties</h2>
                      <p className="muted">More listings in {p.city} that match the way you are searching.</p>
                    </div>
                  </div>
                </Reveal>
                <div className="grid">{related.map((r, i) => <Reveal key={r.id} delay={i * 0.08}><PropertyCard property={r} /></Reveal>)}</div>
              </section>
            )}
          </>
        )}
      </Status>

      <LightboxHost items={gallery} index={open} onClose={close} onMove={move} />
    </>
  );
}
