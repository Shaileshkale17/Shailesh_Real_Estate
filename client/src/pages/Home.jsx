import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Hero from '../components/Hero.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { Counter, Icon, Img, Reveal, Status } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { setMeta } from '../lib/seo.js';

const MapPreview = lazy(() => import('../components/MapPreview.jsx'));

const FEATURES = [
  { icon: 'shield', title: 'Verified listings', text: 'Every home is checked for clear title, approvals and the details that matter before it reaches you.' },
  { icon: 'pin', title: 'Deep local knowledge', text: 'We live and work in Nagpur — from Dharampeth to Besa — so you get advice that fits the street, not just the spreadsheet.' },
  { icon: 'key', title: 'End-to-end guidance', text: 'Site visits, negotiation, paperwork and home loans: one steady team beside you until you have the keys.' },
];

/** Branded first-visit intro: architectural line drawing + progress, skippable, reduced-motion aware. */
function Intro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => !reduce && !sessionStorage.getItem('xyz-intro-done'));
  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = 'hidden';
    const done = () => { setShow(false); sessionStorage.setItem('xyz-intro-done', '1'); document.body.style.overflow = ''; };
    const esc = (e) => e.key === 'Escape' && done();
    window.addEventListener('keydown', esc);
    const t = setTimeout(done, 2400);
    return () => { clearTimeout(t); window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [show]);
  if (!show) return null;
  return (
    <motion.div className="intro" role="presentation" onClick={() => setShow(false)}
      exit={{ y: '-100%', opacity: 0.4 }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <svg viewBox="0 0 220 130" width="220" aria-hidden="true" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <motion.path className="intro-line" d="M10 70 110 8l100 62M28 58v64h164V58M92 122V88h36v34M40 70h32v30H40zM148 70h32v30h-32z"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
        </svg>
        <p className="intro-brand">Shailesh<span>.dev</span></p>
        <p className="intro-sub">Homes, land and commercial spaces in Nagpur</p>
      </motion.div>
      <div className="intro-progress" aria-hidden="true"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} /></div>
      <p className="intro-skip">Click anywhere to enter</p>
    </motion.div>
  );
}

const TYPE_LABEL = { Commercial: 'Commercial spaces', Other: 'Other properties' };
const typeLabel = (t) => TYPE_LABEL[t] || `${t}s`;

const TypeTile = ({ type, image, count }) => (
  <Reveal>
    <Link className="type-tile" to={`/properties?type=${encodeURIComponent(type)}`} aria-label={`Browse ${typeLabel(type).toLowerCase()}`}>
      <Img src={image} alt="" className="type-tile-img" />
      <span className="type-tile-body"><b>{typeLabel(type)}</b><span>{count} listing{count === 1 ? '' : 's'}</span></span>
    </Link>
  </Reveal>
);

export default function Home() {
  const { data, error, loading, retry } = useFetch('/properties');
  const { data: company } = useFetch('/company');
  const featured = useMemo(() => (data || []).filter((p) => p.featured), [data]);
  const showcase = featured[0];
  const types = useMemo(() => {
    const map = new Map();
    (data || []).forEach((p) => {
      if (!map.has(p.type)) map.set(p.type, { type: p.type, image: p.images?.[0], count: 0 });
      map.get(p.type).count += 1;
    });
    return [...map.values()];
  }, [data]);
  const locations = useMemo(() => {
    const map = new Map();
    (data || []).forEach((p) => {
      const key = p.location;
      if (!map.has(key)) map.set(key, { location: key, city: p.city, count: 0, image: p.images?.[0] });
      map.get(key).count += 1;
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [data]);
  const agents = useMemo(() => {
    const map = new Map();
    (data || []).forEach((p) => {
      if (!p.agent || map.has(p.agent.slug)) return;
      map.set(p.agent.slug, { ...p.agent, count: 1 });
    });
    (data || []).forEach((p) => { if (p.agent && map.has(p.agent.slug)) map.get(p.agent.slug).count += 1; });
    return [...map.values()];
  }, [data]);

  useEffect(() => setMeta('Shailesh.dev — Homes, Land and Commercial Spaces in Nagpur',
    'Buy and rent verified homes, plots and commercial spaces in Nagpur. Video walkthroughs, honest advice and end-to-end guidance from Shailesh.dev.'), []);

  return (
    <>
      <Intro />
      <Hero />

      <section className="container section" id="featured">
        <Reveal>
          <div className="section-head">
            <div>
              <span className="eyebrow">Handpicked for you</span>
              <h2>Featured properties</h2>
              <p className="muted">A closer look at a few homes and spaces we are excited about right now.</p>
            </div>
            <Link className="section-link" to="/properties">View all properties <Icon name="arrow" size={18} /></Link>
          </div>
        </Reveal>
        <Status loading={loading} error={error} retry={retry} skeleton={3} empty={featured.length === 0 && 'No featured properties right now.'}>
          <div className="grid">{featured.slice(0, 3).map((p, i) => <Reveal key={p.id} delay={i * 0.08}><PropertyCard property={p} /></Reveal>)}</div>
        </Status>
      </section>

      {types.length > 1 && (
        <section className="container section type-section">
          <Reveal>
            <div className="section-head centered">
              <div>
                <span className="eyebrow">Find your fit</span>
                <h2>Explore by property type</h2>
                <p className="muted">From compact apartments to open plots — start with the kind of space you have in mind.</p>
              </div>
            </div>
          </Reveal>
          <div className="type-grid">
            {types.map((t, i) => <TypeTile key={t.type} {...t} count={t.count} index={i} />)}
          </div>
        </section>
      )}

      {showcase && (
        <section className="container section">
          <Reveal>
            <div className="showcase">
              <div className="showcase-media">
                <Img src={showcase.images?.[0]} alt={showcase.name} className="showcase-img" />
                <span className="chip-badge showcase-flag">Exclusive</span>
              </div>
              <div className="showcase-body">
                <span className="eyebrow">Exclusive property showcase</span>
                <h2>{showcase.name}</h2>
                <p className="muted showcase-loc"><Icon name="pin" size={16} /> {showcase.location}, {showcase.city}</p>
                <p>{showcase.short}. {showcase.description}</p>
                <ul className="showcase-facts">
                  {showcase.bedrooms > 0 && <li><Icon name="bed" size={20} />{showcase.bedrooms} Bedrooms</li>}
                  {showcase.bathrooms > 0 && <li><Icon name="bath" size={20} />{showcase.bathrooms} Bathrooms</li>}
                  {showcase.area > 0 && <li><Icon name="area" size={20} />{showcase.area.toLocaleString('en-IN')} sq ft</li>}
                  <li><Icon name="home" size={20} />{showcase.type}</li>
                </ul>
                <div className="showcase-actions">
                  <Link className="btn btn-orange" to={`/properties/${showcase.id}`}>View this property <Icon name="arrow" size={18} /></Link>
                  <Link className="btn btn-light" to="/properties?featured=true">More exclusives</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {locations.length > 0 && (
        <section className="section locations-band">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Neighbourhoods we know</span>
                  <h2>Discover locations</h2>
                  <p className="muted">Every area has its own character. Start from the ones our clients ask for the most.</p>
                </div>
              </div>
            </Reveal>
            <div className="location-grid">
              {locations.map((l, i) => (
                <Reveal key={l.location} delay={i * 0.06}>
                  <Link className="location-card" to={`/properties?q=${encodeURIComponent(l.location)}`} aria-label={`Properties in ${l.location}`}>
                    <Img src={l.image} alt="" className="location-img" />
                    <span className="location-body"><b>{l.location}</b><span>{l.city} · {l.count} listing{l.count === 1 ? '' : 's'}</span></span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container section map-section">
        <Reveal>
          <div className="section-head">
            <div>
              <span className="eyebrow">Interactive map</span>
              <h2>Explore every listing on the map</h2>
              <p className="muted">Zoom, pan and tap a marker to preview a property — then jump straight to its details.</p>
            </div>
            <Link className="section-link" to="/map">Open full map <Icon name="arrow" size={18} /></Link>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Status loading={loading} error={error} retry={retry} skeleton={1}>
            {data?.length > 0 && (
              <Suspense fallback={<div className="map-preview" aria-hidden="true" />}>
                <MapPreview properties={data} />
              </Suspense>
            )}
          </Status>
        </Reveal>
      </section>

      <section className="container section features-section">
        <Reveal>
          <div className="section-head centered">
            <div>
              <span className="eyebrow">Why Shailesh.dev</span>
              <h2>Property decisions, made clearer</h2>
              <p className="muted">The same care we would want when buying our own home.</p>
            </div>
          </div>
        </Reveal>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <article className="feature">
                <span className="icon-badge"><Icon name={f.icon} size={24} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {company?.stats && (
        <section className="stats" aria-label="Company numbers">
          <div className="container stats-grid">
            <div><b><Counter to={company.stats.propertiesListed} /></b><span>Properties listed</span></div>
            <div><b><Counter to={company.stats.clientsServed} /></b><span>Clients served</span></div>
            <div><b><Counter to={company.stats.yearsExperience} /></b><span>Years of experience</span></div>
          </div>
        </section>
      )}

      {agents.length > 0 && (
        <section className="container section">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">The people behind the keys</span>
                <h2>Featured agents</h2>
                <p className="muted">Talk directly to the agent who knows the listing best.</p>
              </div>
              <Link className="section-link" to="/about">Meet the whole team <Icon name="arrow" size={18} /></Link>
            </div>
          </Reveal>
          <div className="agent-grid">
            {agents.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.08}>
                <article className="person agent-card">
                  <div className="avatar" aria-hidden="true">{a.name[0]}</div>
                  <h3>{a.name}</h3>
                  <p className="muted">{a.company} · {a.count} active listing{a.count === 1 ? '' : 's'}</p>
                  <p>{a.bio}</p>
                  <p className="agent-lines">
                    <a href={`tel:${a.phone.replace(/\s/g, '')}`}><Icon name="phone" size={16} /> {a.phone}</a><br />
                    <a href={`mailto:${a.email}`}><Icon name="mail" size={16} /> {a.email}</a>
                  </p>
                  <Link className="btn btn-dark btn-sm block" to={`/contact?subject=${encodeURIComponent(`Enquiry for ${a.name}`)}`}>Get in touch</Link>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container section">
        <Reveal>
          <div className="cta-band">
            <div>
              <span className="eyebrow light">Your next address</span>
              <h2>Ready to find a place you will love?</h2>
              <p>Tell us what you are looking for. We will shortlist the right options and arrange a visit.</p>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-dark" to="/properties">Browse properties</Link>
              <Link className="btn btn-light" to="/contact">Talk to an agent</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
