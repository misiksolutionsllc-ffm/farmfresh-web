'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Wellington, FL area coordinates (FarmFresh HQ)
const WELLINGTON_CENTER = { lat: 26.6587, lng: -80.2684 };

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'driver' | 'customer' | 'merchant' | 'pickup' | 'dropoff';
  label: string;
  sublabel?: string;
  pulse?: boolean;
}

interface MapRoute {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color?: string;
}

interface LiveMapProps {
  markers?: MapMarker[];
  routes?: MapRoute[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showDriverLocation?: boolean;
  className?: string;
}

const MARKER_ICONS: Record<string, { emoji: string; bg: string; border: string }> = {
  driver: { emoji: '🚗', bg: '#2563EB', border: '#1D4ED8' },
  customer: { emoji: '🏠', bg: '#059669', border: '#047857' },
  merchant: { emoji: '🏪', bg: '#EA580C', border: '#C2410C' },
  pickup: { emoji: '📦', bg: '#8B5CF6', border: '#7C3AED' },
  dropoff: { emoji: '📍', bg: '#10B981', border: '#059669' },
};

export function LiveMap({
  markers = [],
  routes = [],
  center = WELLINGTON_CENTER,
  zoom = 13,
  height = '400px',
  showDriverLocation = false,
  className,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [driverPos, setDriverPos] = useState(center);

  // Simulate driver movement
  useEffect(() => {
    if (!showDriverLocation) return;
    const interval = setInterval(() => {
      setDriverPos((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.002,
        lng: prev.lng + (Math.random() - 0.5) * 0.002,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [showDriverLocation]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || loaded) return;

    // Inject Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!loaded || !mapRef.current || !(window as any).L) return;
    const L = (window as any).L;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], zoom);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Zoom control on right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add markers
    const allMarkers = [...markers];

    // Add driver position marker
    if (showDriverLocation) {
      allMarkers.push({
        id: 'driver-live',
        lat: driverPos.lat,
        lng: driverPos.lng,
        type: 'driver',
        label: 'Your Location',
        sublabel: 'Live',
        pulse: true,
      });
    }

    allMarkers.forEach((m) => {
      const iconConfig = MARKER_ICONS[m.type] || MARKER_ICONS.customer;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            background: ${iconConfig.bg};
            border: 3px solid ${iconConfig.border};
            border-radius: 50% 50% 50% 4px;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            ${m.pulse ? 'animation: markerPulse 2s ease-in-out infinite;' : ''}
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">${iconConfig.emoji}</span>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [4, 42],
        popupAnchor: [17, -38],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 150px;">
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">${m.label}</div>
          ${m.sublabel ? `<div style="font-size: 12px; color: #64748b;">${m.sublabel}</div>` : ''}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}</div>
        </div>
      `);
    });

    // Draw routes
    routes.forEach((route) => {
      // Simulate a curved route with intermediate points
      const midLat = (route.from.lat + route.to.lat) / 2 + (Math.random() - 0.5) * 0.01;
      const midLng = (route.from.lng + route.to.lng) / 2 + (Math.random() - 0.5) * 0.01;

      const polyline = L.polyline(
        [
          [route.from.lat, route.from.lng],
          [midLat, midLng],
          [route.to.lat, route.to.lng],
        ],
        {
          color: route.color || '#3B82F6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
          smoothFactor: 2,
        }
      ).addTo(map);
    });

    // Fit bounds if we have markers
    if (allMarkers.length > 1) {
      const bounds = L.latLngBounds(allMarkers.map((m: MapMarker) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loaded, markers, routes, center, zoom, showDriverLocation, driverPos]);

  // Inject marker pulse animation
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('#marker-pulse-style')) return;
    const style = document.createElement('style');
    style.id = 'marker-pulse-style';
    style.textContent = `
      @keyframes markerPulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0 rgba(37,99,235,0.4); }
        50% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 12px rgba(37,99,235,0); }
      }
      .custom-marker { background: none !important; border: none !important; }
      .leaflet-popup-content-wrapper {
        background: #fff; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      }
      .leaflet-popup-tip { background: #fff; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className={cn('relative rounded-2xl overflow-hidden border border-white/5', className)} style={{ height }}>
      {!loaded && (
        <div className="absolute inset-0 bg-surface-800 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

// Pre-configured driver map
export function DriverMapView({
  pickupLat,
  pickupLng,
  pickupLabel,
  dropoffLat,
  dropoffLng,
  dropoffLabel,
  driverLat,
  driverLng,
}: {
  pickupLat?: number;
  pickupLng?: number;
  pickupLabel?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  dropoffLabel?: string;
  driverLat?: number;
  driverLng?: number;
}) {
  const markers: MapMarker[] = [];
  const routes: MapRoute[] = [];

  if (driverLat && driverLng) {
    markers.push({ id: 'driver', lat: driverLat, lng: driverLng, type: 'driver', label: 'You', sublabel: 'Current location', pulse: true });
  }
  if (pickupLat && pickupLng) {
    markers.push({ id: 'pickup', lat: pickupLat, lng: pickupLng, type: 'pickup', label: pickupLabel || 'Pickup', sublabel: 'Merchant location' });
  }
  if (dropoffLat && dropoffLng) {
    markers.push({ id: 'dropoff', lat: dropoffLat, lng: dropoffLng, type: 'dropoff', label: dropoffLabel || 'Dropoff', sublabel: 'Customer location' });
  }

  if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
    if (driverLat && driverLng) {
      routes.push({ from: { lat: driverLat, lng: driverLng }, to: { lat: pickupLat, lng: pickupLng }, color: '#3B82F6' });
    }
    routes.push({ from: { lat: pickupLat, lng: pickupLng }, to: { lat: dropoffLat, lng: dropoffLng }, color: '#10B981' });
  }

  return <LiveMap markers={markers} routes={routes} height="350px" showDriverLocation={!driverLat} />;
}

// Pre-configured God Mode overview map
export function GodModeMapView({
  drivers,
  merchants,
  deliveries,
}: {
  drivers: { id: string; name: string; lat: number; lng: number; online?: boolean }[];
  merchants: { id: string; name: string; lat: number; lng: number }[];
  deliveries: { id: string; pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number; status: string }[];
}) {
  const markers: MapMarker[] = [
    ...drivers.filter((d) => d.online).map((d) => ({
      id: d.id, lat: d.lat, lng: d.lng, type: 'driver' as const, label: d.name, sublabel: '🟢 Online', pulse: true,
    })),
    ...drivers.filter((d) => !d.online).map((d) => ({
      id: d.id, lat: d.lat, lng: d.lng, type: 'driver' as const, label: d.name, sublabel: '⚫ Offline',
    })),
    ...merchants.map((m) => ({
      id: m.id, lat: m.lat, lng: m.lng, type: 'merchant' as const, label: m.name, sublabel: 'Merchant',
    })),
  ];

  const routes: MapRoute[] = deliveries
    .filter((d) => d.status !== 'Delivered')
    .map((d) => ({
      from: { lat: d.pickupLat, lng: d.pickupLng },
      to: { lat: d.dropoffLat, lng: d.dropoffLng },
      color: d.status === 'Pending' ? '#F59E0B' : '#3B82F6',
    }));

  return <LiveMap markers={markers} routes={routes} height="500px" zoom={12} />;
}
