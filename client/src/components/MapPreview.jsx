import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { formatPrice } from '@shared/format.js';
import { Img } from './ui.jsx';

const pin = L.divIcon({ className: 'pin', html: '<span class="pin-ring"></span><span class="pin-dot"></span>', iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14], tooltipAnchor: [0, -14] });

/** Small interactive map used in the homepage preview section. */
export default function MapPreview({ properties }) {
  const bounds = L.latLngBounds(properties.map((p) => [p.coordinates.lat, p.coordinates.lng])).pad(0.25);
  return (
    <div className="map-preview">
      <MapContainer bounds={bounds} scrollWheelZoom={false} className="map-preview-inner" aria-label="Preview map of properties">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {properties.map((p) => (
          <Marker key={p.id} position={[p.coordinates.lat, p.coordinates.lng]} icon={pin} title={p.name}>
            <Tooltip direction="top" opacity={1}><strong>{p.name}</strong><br />{formatPrice(p.price)}</Tooltip>
            <Popup minWidth={250} maxWidth={270}>
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
      <Link className="map-preview-cta" to="/map">Open the full property map</Link>
    </div>
  );
}
