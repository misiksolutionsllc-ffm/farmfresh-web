'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_CENTER = { lat: 26.6587, lng: -80.2684 };

// ============================================
// REAL GPS HOOK
// ============================================
export function useGPS() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    const onOk = (p: GeolocationPosition) => {
      setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      setLoading(false);
      setError(null);
    };
    const onErr = (e: GeolocationPositionError) => { setError(e.message); setLoading(false); };
    navigator.geolocation.getCurrentPosition(onOk, onErr, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    watchRef.current = navigator.geolocation.watchPosition(onOk, onErr, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  return { position, error, loading };
}

// ============================================
// TYPES
// ============================================
interface MapMarker {
  id: string; lat: number; lng: number;
  type: 'driver' | 'customer' | 'merchant' | 'pickup' | 'dropoff' | 'you';
  label: string; sublabel?: string; pulse?: boolean;
}

interface MapRoute {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color?: string;
}

interface LiveMapProps {
  markers?: MapMarker[]; routes?: MapRoute[];
  center?: { lat: number; lng: number };
  zoom?: number; height?: string;
  showMyLocation?: boolean; className?: string;
}

const ICONS: Record<string, { emoji: string; bg: string; border: string }> = {
  driver: { emoji: '🚗', bg: '#2563EB', border: '#1D4ED8' },
  customer: { emoji: '🏠', bg: '#059669', border: '#047857' },
  merchant: { emoji: '🌾', bg: '#EA580C', border: '#C2410C' },
  pickup: { emoji: '📦', bg: '#8B5CF6', border: '#7C3AED' },
  dropoff: { emoji: '📍', bg: '#10B981', border: '#059669' },
  you: { emoji: '📱', bg: '#2563EB', border: '#1E40AF' },
};

// ============================================
// LIVE MAP
// ============================================
export function LiveMap({ markers = [], routes = [], center, zoom = 14, height = '400px', showMyLocation = false, className }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const { position: gps, error: gpsErr, loading: gpsLoad } = useGPS();
  const effCenter = center || gps || DEFAULT_CENTER;

  // Load Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || ready) return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l);
    }
    if (!(window as any).L) {
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = () => setReady(true); document.head.appendChild(s);
    } else setReady(true);
  }, []);

  // Styles
  useEffect(() => {
    if (document.querySelector('#map-css')) return;
    const s = document.createElement('style'); s.id = 'map-css';
    s.textContent = `
      @keyframes mPulse{0%,100%{box-shadow:0 4px 12px rgba(0,0,0,.4),0 0 0 0 rgba(37,99,235,.4)}50%{box-shadow:0 4px 12px rgba(0,0,0,.4),0 0 0 14px rgba(37,99,235,0)}}
      @keyframes gpsDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}
      .custom-marker{background:none!important;border:none!important}
      .leaflet-popup-content-wrapper{background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.2)}
      .leaflet-popup-tip{background:#fff}`;
    document.head.appendChild(s);
  }, []);

  // Map init + update
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = (window as any).L;

    if (!mapInst.current) {
      const m = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([effCenter.lat, effCenter.lng], zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(m);
      L.control.zoom({ position: 'topright' }).addTo(m);
      mapInst.current = m;
      layerRef.current = L.layerGroup().addTo(m);
    }

    const map = mapInst.current;
    const layer = layerRef.current;
    layer.clearLayers();

    const all = [...markers];
    if (showMyLocation && gps) {
      all.push({ id: 'me', lat: gps.lat, lng: gps.lng, type: 'you', label: 'You are here', sublabel: `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`, pulse: true });
    }

    all.forEach((m) => {
      const ic = ICONS[m.type] || ICONS.customer;
      const isMe = m.type === 'you';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: isMe
          ? `<div style="width:18px;height:18px;background:#2563EB;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(37,99,235,.3),0 2px 8px rgba(0,0,0,.3);animation:gpsDot 2s ease-in-out infinite"></div>`
          : `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:${ic.bg};border:3px solid ${ic.border};border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,.4);${m.pulse?'animation:mPulse 2s ease-in-out infinite':''}"><span style="transform:rotate(45deg);font-size:17px">${ic.emoji}</span></div>`,
        iconSize: isMe ? [18,18] : [40,40],
        iconAnchor: isMe ? [9,9] : [4,40],
        popupAnchor: isMe ? [0,-12] : [16,-36],
      });
      L.marker([m.lat, m.lng], { icon }).addTo(layer).bindPopup(`<div style="font-family:'DM Sans',sans-serif;min-width:130px"><b style="font-size:14px;color:#0f172a">${m.label}</b>${m.sublabel?`<div style="font-size:12px;color:#64748b">${m.sublabel}</div>`:''}</div>`);
    });

    routes.forEach((r) => {
      L.polyline([[r.from.lat,r.from.lng],[r.to.lat,r.to.lng]], { color: r.color||'#3B82F6', weight: 4, opacity: .8, dashArray: '8,8' }).addTo(layer);
    });

    if (all.length > 1) {
      map.fitBounds(L.latLngBounds(all.map((m: MapMarker)=>[m.lat,m.lng])), { padding: [50,50], maxZoom: 16 });
    } else if (all.length === 1) {
      map.setView([all[0].lat, all[0].lng], zoom);
    } else if (gps) {
      map.setView([gps.lat, gps.lng], zoom);
    }
  }, [ready, markers, routes, gps, showMyLocation, effCenter, zoom]);

  useEffect(() => { return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } }; }, []);

  return (
    <div className={cn('relative rounded-2xl overflow-hidden border border-white/5', className)} style={{ height }}>
      {(!ready || gpsLoad) && (
        <div className="absolute inset-0 bg-surface-800 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">{gpsLoad ? 'Getting your location...' : 'Loading map...'}</p>
          </div>
        </div>
      )}
      {gpsErr && !gps && (
        <div className="absolute top-2 left-2 right-2 z-20 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <span className="text-xs text-amber-400">📍 Enable location access for real-time GPS tracking</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// ============================================
// DRIVER MAP VIEW
// ============================================
export function DriverMapView({ pickupLat, pickupLng, pickupLabel, dropoffLat, dropoffLng, dropoffLabel }: {
  pickupLat?: number; pickupLng?: number; pickupLabel?: string;
  dropoffLat?: number; dropoffLng?: number; dropoffLabel?: string;
}) {
  const markers: MapMarker[] = [];
  const routes: MapRoute[] = [];
  if (pickupLat && pickupLng) markers.push({ id: 'pickup', lat: pickupLat, lng: pickupLng, type: 'pickup', label: pickupLabel || 'Pickup', sublabel: 'Farmer location' });
  if (dropoffLat && dropoffLng) markers.push({ id: 'dropoff', lat: dropoffLat, lng: dropoffLng, type: 'dropoff', label: dropoffLabel || 'Dropoff', sublabel: 'Customer location' });
  if (pickupLat && pickupLng && dropoffLat && dropoffLng) routes.push({ from: { lat: pickupLat, lng: pickupLng }, to: { lat: dropoffLat, lng: dropoffLng }, color: '#10B981' });
  return <LiveMap markers={markers} routes={routes} height="350px" showMyLocation />;
}

// ============================================
// GOD MODE MAP VIEW
// ============================================
export function GodModeMapView({ drivers, merchants, deliveries }: {
  drivers: { id: string; name: string; lat: number; lng: number; online?: boolean }[];
  merchants: { id: string; name: string; lat: number; lng: number }[];
  deliveries: { id: string; pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number; status: string }[];
}) {
  const markers: MapMarker[] = [
    ...drivers.filter(d=>d.online).map(d=>({ id:d.id,lat:d.lat,lng:d.lng,type:'driver' as const,label:d.name,sublabel:'🟢 Online',pulse:true })),
    ...drivers.filter(d=>!d.online).map(d=>({ id:d.id,lat:d.lat,lng:d.lng,type:'driver' as const,label:d.name,sublabel:'⚫ Offline' })),
    ...merchants.map(m=>({ id:m.id,lat:m.lat,lng:m.lng,type:'merchant' as const,label:m.name,sublabel:'Farmer' })),
  ];
  const routes: MapRoute[] = deliveries.filter(d=>d.status!=='Delivered').map(d=>({
    from:{lat:d.pickupLat,lng:d.pickupLng}, to:{lat:d.dropoffLat,lng:d.dropoffLng},
    color: d.status==='Pending'?'#F59E0B':'#3B82F6',
  }));
  return <LiveMap markers={markers} routes={routes} height="500px" zoom={13} showMyLocation />;
}
