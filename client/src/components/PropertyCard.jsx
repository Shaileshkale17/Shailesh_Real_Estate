import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '@shared/format.js';
import { Icon, Img } from './ui.jsx';

const readFavs = () => { try { return JSON.parse(localStorage.getItem('xyz-favs')) || []; } catch { return []; } };

export default function PropertyCard({ property: p }) {
  const [fav, setFav] = useState(() => readFavs().includes(p.id));
  useEffect(() => {
    const favs = readFavs();
    const next = fav ? [...favs, p.id] : favs.filter((x) => x !== p.id);
    localStorage.setItem('xyz-favs', JSON.stringify([...new Set(next)]));
  }, [fav]);

  const toggleFav = (e) => { e.preventDefault(); setFav((f) => !f); };

  return (
    <motion.article className="card" layout whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <div className="card-media">
        <Img src={p.images?.[0]} alt={`${p.name} exterior`} />
        <span className="chip-badge">{p.type}</span>
        <button className={`fav-btn ${fav ? 'on' : ''}`} aria-pressed={fav}
          aria-label={fav ? `Remove ${p.name} from favourites` : `Save ${p.name} to favourites`} onClick={toggleFav}>
          <Icon name="heart" size={17} fill={fav ? 'currentColor' : 'none'} strokeWidth={fav ? 0 : 1.8} />
        </button>
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p className="muted">{p.location}, {p.city}</p>
        {p.short && <p className="card-short">{p.short}</p>}
        <ul className="card-meta" aria-label="Property facts">
          {p.bedrooms > 0 && <li><Icon name="bed" size={17} />{p.bedrooms} bd</li>}
          {p.bathrooms > 0 && <li><Icon name="bath" size={17} />{p.bathrooms} ba</li>}
          {p.area > 0 && <li><Icon name="area" size={17} />{p.area.toLocaleString('en-IN')} sq ft</li>}
        </ul>
        <div className="card-foot">
          <strong className="price">{formatPrice(p.price)}</strong>
          <Link className="btn btn-dark btn-sm" to={`/properties/${p.id}`} aria-label={`View details of ${p.name}`}>View Details</Link>
        </div>
      </div>
    </motion.article>
  );
}
