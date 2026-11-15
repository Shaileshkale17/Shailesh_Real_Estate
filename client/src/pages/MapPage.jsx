import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice } from '@shared/format.js';
import { Icon, Img, Status } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';

const pin = L.divIcon({ className: 'pin', html: '<span class="pin-ring"></span><span class="pin-dot"></span>', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14], tooltipAnchor: [0, -14] });

export default function MapPage() {
  const { data, error, loading, retry } = useFetch('/properties');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const markerRefs = useRef({});
  const cardRefs = useRef({});

  const list = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return needle ? data.filter((p) => `${p.name} ${p.location} ${p.city}`.toLowerCase().includes(needle)) : data;
  }, [data, query]);

  const bounds = useMemo(() => (list.length ? L.latLngBounds(list.map((p) => [p.coordinates.lat, p.coordinates.lng])).pad(0.2) : null), [list]);

  const select = (id, fromMap = false) => {
    setActive(id);
    if (!fromMap) markerRefs.current[id]?.openPopup();
    else cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="map-page split">
      <aside className="map-list" aria-label="Property list">
        <div className="map-list-head">
          <span className="eyebrow">Explore Nagpur</span>
          <h1>Property map</h1>
          <p>{data ? `${list.length} of ${data.length} listings shown — click a card or a marker to connect them.` : 'Loading listings…'}</p>
          <div className="search-wrap">
            <Icon name="pin" size={18} />
            <input type="search" placeholder="Filter by name or area" aria-label="Filter properties on map" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <Status loading={loading} error={error} retry={retry} empty={list.length === 0 && 'No properties match that filter.'} skeleton={3}>
          <div className="map-cards">
            {list.map((p) => (
              <button key={p.id} ref={(el) => { cardRefs.current[p.id] = el; }}
                className={`map-card ${active === p.id ? 'on' : ''}`} onClick={() => select(p.id)}>
                <Img src={p.images?.[0]} alt="" className="map-card-img" />
                <span className="map-card-body">
                  <b>{p.name}</b>
                  <span className="muted">{p.location}, {p.city}</span>
                  <strong className="price">{formatPrice(p.price)}</strong>
                  <span className="map-card-meta">{p.type}{p.bedrooms ? ` · ${p.bedrooms} bd` : ''}{p.area ? ` · ${p.area.toLocaleString('en-IN')} sq ft` : ''}</span>
                </span>
                <span className="map-card-go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
              </button>
            ))}
          </div>
        </Status>
      </aside>

      <div className="map-holder">
        {(loading || error) && <div className="map-status"><Status loading={loading} error={error} retry={retry} skeleton={1} /></div>}
        {bounds && (
          <MapContainer bounds={bounds} scrollWheelZoom className="map" aria-label="Map of properties">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {list.map((p) => (
              <Marker key={p.id} position={[p.coordinates.lat, p.coordinates.lng]}
                icon={pin} title={p.name} keyboard
                ref={(m) => { markerRefs.current[p.id] = m; }}
                eventHandlers={{ click: () => select(p.id, true) }}>
                <Tooltip direction="top" opacity={1}><strong>{p.name}</strong><br />{formatPrice(p.price)}</Tooltip>
                <Popup minWidth={260} maxWidth={280}>
                  <div className="pop">
                    <Img src={p.images?.[0]} alt={p.name} />
                    <h3>{p.name}</h3>
                    <p className="muted">{p.location}, {p.city}</p>
                    <strong className="price">{formatPrice(p.price)}</strong>
                    <p>{p.short}</p>
                    <Link className="btn btn-orange block" to={`/properties/${p.id}`}>View Details</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
