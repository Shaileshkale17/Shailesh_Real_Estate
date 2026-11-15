import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pin = L.divIcon({ className: 'pin', html: '<span class="pin-ring"></span><span class="pin-dot"></span>', iconSize: [34, 34], iconAnchor: [17, 17] });

/** Interactive location map on the property details page. */
export default function DetailMap({ property: p }) {
  return (
    <MapContainer center={[p.coordinates.lat, p.coordinates.lng]} zoom={14} scrollWheelZoom={false} className="detail-map-inner" aria-label={`Map showing ${p.name}`}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[p.coordinates.lat, p.coordinates.lng]} icon={pin}>
        <Popup minWidth={200}><strong>{p.name}</strong><br />{p.address}</Popup>
      </Marker>
    </MapContainer>
  );
}
