import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Circle as LeafletCircle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapsApi } from '../../hooks/useMapsApi';

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

const AdaptiveMap = ({ 
  center, 
  zoom = 13, 
  onClick, 
  children, 
  style = mapContainerStyle,
  radiusMeters,
  secondaryRadiusMeters,
  primaryRadiusColor = '#2e7d32',
  secondaryRadiusColor = '#1565c0',
  ...props 
}) => {
  const { apiType, apiKey, googleFatalError } = useMapsApi();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (apiType !== 'google' || googleFatalError) {
      setIsGoogleLoaded(false);
      return;
    }

    const markIfReady = () => {
      const ready = !!(window.google && window.google.maps && window.google.maps.Map);
      setIsGoogleLoaded(ready);
    };

    if (window.google && window.google.maps && window.google.maps.Map) {
      setIsGoogleLoaded(true);
      return;
    }

    let script = document.getElementById('google-maps-script');
    if (!script && apiKey) {
      const params = new URLSearchParams({ key: apiKey, libraries: 'places', v: 'weekly' });
      script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    if (script) {
      const onLoad = () => markIfReady();
      const onError = () => setIsGoogleLoaded(false);
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      // Also poll briefly because Google attaches globals after load
      const interval = setInterval(markIfReady, 300);
      return () => {
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        clearInterval(interval);
      };
    }
  }, [apiType, apiKey, googleFatalError]);

  const handleMapClick = (e) => {
    if (onClick) {
      // Pass additional context for Ola Maps
      if (apiType === 'ola') {
        const olaEvent = {
          ...e,
          lat: center?.lat,
          lng: center?.lng,
          apiType: 'ola'
        };
        onClick(olaEvent);
      } else {
        onClick(e);
      }
    }
  };

  if (apiType === 'google' && isGoogleLoaded) {
    return (
      <GoogleMap
        mapContainerStyle={style}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        {...props}
      >
        {children}
      </GoogleMap>
    );
  }

  // Fallback to Ola Maps or simple div
  // If Google failed to load (e.g., billing error), or Ola chosen → render Leaflet map
  if (apiType === 'ola' || googleFatalError || (apiType === 'google' && !isGoogleLoaded)) {
    const leafletCenter = [center?.lat || 0, center?.lng || 0];
    return (
      <MapContainer
        center={leafletCenter}
        zoom={zoom}
        style={style}
        whenCreated={(map) => {
          map.on('click', (evt) => {
            const { lat, lng } = evt.latlng || {};
            if (onClick && lat && lng) {
              onClick({ lat, lng, apiType: 'ola' });
            }
          });
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LeafletMarker position={leafletCenter} />
        {typeof radiusMeters === 'number' && radiusMeters > 0 && (
          <LeafletCircle
            center={leafletCenter}
            radius={radiusMeters}
            pathOptions={{ color: primaryRadiusColor, fillOpacity: 0.12 }}
          />
        )}
        {typeof secondaryRadiusMeters === 'number' && secondaryRadiusMeters > 0 && (
          <LeafletCircle
            center={leafletCenter}
            radius={secondaryRadiusMeters}
            pathOptions={{ color: secondaryRadiusColor, fillOpacity: 0.08 }}
          />
        )}
      </MapContainer>
    );
  }

  // Default fallback
  return (
    <div style={{ 
      ...style, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      {apiType === 'google' ? 'Loading maps...' : 'Maps not available'}
    </div>
  );
};

export default AdaptiveMap; 
