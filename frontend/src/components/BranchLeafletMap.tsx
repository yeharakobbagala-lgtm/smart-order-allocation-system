"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;
const SELECTED_ZOOM = 15;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BranchLeafletMapProps {
  latitude: number | null;
  longitude: number | null;
  disabled?: boolean;
  onMapSelect: (lat: number, lng: number) => void;
}

function MapEffects({
  latitude,
  longitude,
  disabled,
  onMapSelect,
}: BranchLeafletMapProps) {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [map, latitude, longitude]);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], SELECTED_ZOOM);
    } else {
      map.setView(SRI_LANKA_CENTER, DEFAULT_ZOOM);
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    if (disabled) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [disabled, map]);

  useMapEvents({
    click(e) {
      if (disabled) return;
      onMapSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function BranchLeafletMap({
  latitude,
  longitude,
  disabled,
  onMapSelect,
}: BranchLeafletMapProps) {
  const hasCoords = latitude != null && longitude != null;
  const center: [number, number] = hasCoords
    ? [latitude, longitude]
    : SRI_LANKA_CENTER;
  const zoom = hasCoords ? SELECTED_ZOOM : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-56 w-full"
      scrollWheelZoom={!disabled}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEffects
        latitude={latitude}
        longitude={longitude}
        disabled={disabled}
        onMapSelect={onMapSelect}
      />
      {hasCoords ? (
        <Marker
          position={[latitude, longitude]}
          icon={markerIcon}
          draggable={!disabled}
          eventHandlers={{
            dragend: (event) => {
              if (disabled) return;
              const marker = event.target as L.Marker;
              const pos = marker.getLatLng();
              onMapSelect(pos.lat, pos.lng);
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
