import { useEffect } from 'react';
import { Icon, Counter, Img, PageHeader, Reveal, Status } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { setMeta } from '../lib/seo.js';

const Person = ({ p }) => (
  <article className="person">
    <div className="avatar" aria-hidden="true">{p.name[0]}</div>
    <h3>{p.name}</h3>
    <p className="muted">{p.role}</p>
    {p.bio && <p>{p.bio}</p>}
  </article>
);

export default function About() {
  const { data: c, error, loading, retry } = useFetch('/company');
  useEffect(() => setMeta('About Us . Shailesh.dev', 'The story, leadership, agents and offices behind Shailesh.dev in Nagpur.'), []);
  return (
    <>
      <PageHeader title="About Us">{c?.tagline || 'A Nagpur-based agency focused on honest advice and well-built homes.'}</PageHeader>
      <Status loading={loading} error={error} retry={retry} skeleton={3}>
        {c && (
          <>
            <section className="container section">
              <div className="about-intro">
                <Reveal>
                  <span className="eyebrow">Our story</span>
                  <h2>Built on trust, one address at a time</h2>
                  <p className="prose">{c.story} What began as a small Civil Lines office has grown into a team that knows Nagpur street by street — and still treats every client like a neighbour.</p>
                  <ol className="timeline">{c.history.map((h) => <li key={h.year}><strong>{h.year}</strong><span>{h.text}</span></li>)}</ol>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="about-media">
                    <Img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=75" alt="A bright modern home interior" />
                    <div className="about-media-badge"><b>Since 2012</b><span>Helping families across Vidarbha</span></div>
                  </div>
                </Reveal>
              </div>
            </section>

            <section className="container section">
              <div className="mission-grid">
                <Reveal>
                  <article className="info-card">
                    <span className="icon-badge"><Icon name="spark" size={24} /></span>
                    <h3>Our mission</h3>
                    <p>{c.mission}</p>
                  </article>
                </Reveal>
                <Reveal delay={0.08}>
                  <article className="info-card">
                    <span className="icon-badge"><Icon name="pin" size={24} /></span>
                    <h3>Our vision</h3>
                    <p>{c.vision}</p>
                  </article>
                </Reveal>
                <Reveal delay={0.16}>
                  <article className="info-card">
                    <span className="icon-badge"><Icon name="key" size={24} /></span>
                    <h3>Our expertise</h3>
                    <ul className="tags compact">{c.expertise.map((x) => <li key={x}>{x}</li>)}</ul>
                  </article>
                </Reveal>
              </div>
            </section>

            <section className="stats" aria-label="Company numbers">
              <div className="container stats-grid">
                <div><b><Counter to={c.stats.propertiesListed} /></b><span>Properties listed</span></div>
                <div><b><Counter to={c.stats.clientsServed} /></b><span>Clients served</span></div>
                <div><b><Counter to={c.stats.yearsExperience} /></b><span>Years of experience</span></div>
              </div>
            </section>

            <section className="container section">
              <Reveal>
                <div className="section-head">
                  <div>
                    <span className="eyebrow">Recognition</span>
                    <h2>Achievements</h2>
                  </div>
                </div>
                <ul className="tags">{c.achievements.map((x) => <li key={x}>{x}</li>)}</ul>
              </Reveal>

              <Reveal>
                <div className="section-head spaced">
                  <div>
                    <span className="eyebrow">The people</span>
                    <h2>Leadership</h2>
                  </div>
                </div>
                <div className="grid people-grid">{c.leadership.map((p) => <Person key={p.name} p={p} />)}</div>
              </Reveal>

              <Reveal>
                <div className="section-head spaced">
                  <div>
                    <span className="eyebrow">Day to day</span>
                    <h2>Our team</h2>
                  </div>
                </div>
                <div className="grid people-grid">{c.team.map((p) => <Person key={p.name} p={p} />)}</div>
              </Reveal>

              <Reveal>
                <div className="section-head spaced">
                  <div>
                    <span className="eyebrow">Come say hello</span>
                    <h2>Our offices</h2>
                  </div>
                </div>
                <div className="office-grid">{c.offices.map((o) => <div className="office" key={o.city}><span className="icon-badge"><Icon name="pin" size={22} /></span><h3>{o.city}</h3><p>{o.address}</p></div>)}</div>
              </Reveal>
            </section>
          </>
        )}
      </Status>
    </>
  );
}
