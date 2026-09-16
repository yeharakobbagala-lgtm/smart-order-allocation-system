"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Alert, Button, Input, Spinner, IconMapPin } from "@/components/ui";

export interface BranchLocationValue {
  address: string;
  latitude: number;
  longitude: number;
}

interface Props {
  address: string;
  onAddressChange: (address: string) => void;
  latitude: number | null;
  longitude: number | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name?: string;
  error?: string;
}

const NOMINATIM_HEADERS: HeadersInit = {
  Accept: "application/json",
};

const LeafletMap = dynamic(() => import("./BranchLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center bg-[#F8FAFC] text-sm text-[#64748B]">
      <span className="inline-flex items-center gap-2">
        <Spinner size="sm" className="text-[#4F46E5]" />
        Loading map…
      </span>
    </div>
  ),
});

async function searchAddress(query: string): Promise<NominatimSearchResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "lk",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: NOMINATIM_HEADERS }
  );

  if (!res.ok) {
    throw new Error("Address lookup failed. Please try again in a moment.");
  }

  const data = (await res.json()) as NominatimSearchResult[];
  return data[0] ?? null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    { headers: NOMINATIM_HEADERS }
  );

  if (!res.ok) {
    throw new Error("Could not look up an address for this location.");
  }

  const data = (await res.json()) as NominatimReverseResult;
  if (data.error || !data.display_name) return null;
  return data.display_name;
}

export function BranchLocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onCoordinatesChange,
  disabled,
}: Props) {
  const [geoError, setGeoError] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  const applyCoordinates = useCallback(
    async (lat: number, lng: number, shouldReverseGeocode: boolean) => {
      onCoordinatesChange(lat, lng);
      if (!shouldReverseGeocode) return;

      try {
        const name = await reverseGeocode(lat, lng);
        if (name) {
          onAddressChange(name);
          setGeoError("");
        }
      } catch {
        // Keep selected coordinates even if reverse geocoding fails.
        setGeoError(
          "Location updated, but the address could not be resolved automatically."
        );
      }
    },
    [onAddressChange, onCoordinatesChange]
  );

  const findLocation = async () => {
    setGeoError("");
    if (!address.trim()) {
      setGeoError("Enter a branch address before looking it up.");
      return;
    }

    setGeocoding(true);
    try {
      const result = await searchAddress(address.trim());
      if (!result) {
        setGeoError(
          "No results found for that address. Try a more specific Sri Lanka address."
        );
        return;
      }

      const lat = Number(result.lat);
      const lng = Number(result.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setGeoError("The location result was invalid. Please try another address.");
        return;
      }

      onAddressChange(result.display_name || address.trim());
      onCoordinatesChange(lat, lng);
      setGeoError("");
    } catch (err) {
      setGeoError(
        err instanceof Error
          ? err.message
          : "Address lookup failed. Please try again."
      );
    } finally {
      setGeocoding(false);
    }
  };

  const useCurrentLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not available in this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await applyCoordinates(
            pos.coords.latitude,
            pos.coords.longitude,
            true
          );
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            "Location permission was denied. Allow location access or enter an address instead."
          );
        } else if (err.code === err.TIMEOUT) {
          setGeoError("Getting your location timed out. Please try again.");
        } else {
          setGeoError(
            "Could not get your current location. Try again or enter an address."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="space-y-3">
      <Input
        label="Branch Address"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="e.g. Colombo 03, Sri Lanka"
        disabled={disabled}
        hint="Use Find Location to resolve the address, or select a location directly on the map."
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={geocoding}
          disabled={disabled}
          onClick={() => void findLocation()}
          icon={<IconMapPin size={14} />}
        >
          Find Location
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={locating}
          disabled={disabled}
          onClick={useCurrentLocation}
        >
          Use Current Location
        </Button>
      </div>

      {geoError ? <Alert variant="warning">{geoError}</Alert> : null}

      <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <LeafletMap
          latitude={latitude}
          longitude={longitude}
          disabled={disabled}
          onMapSelect={(lat, lng) => {
            void applyCoordinates(lat, lng, true);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
          <p className="text-xs text-[#94A3B8]">Latitude</p>
          <p className="font-mono-data text-sm font-semibold text-[#0F172A]">
            {latitude != null ? latitude.toFixed(6) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
          <p className="text-xs text-[#94A3B8]">Longitude</p>
          <p className="font-mono-data text-sm font-semibold text-[#0F172A]">
            {longitude != null ? longitude.toFixed(6) : "—"}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#94A3B8]">
        Click the map or drag the marker to fine-tune the location. Latitude and
        longitude are required before you can save the branch.
      </p>
    </div>
  );
}
