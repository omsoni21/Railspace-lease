"use client";

import { useState, useMemo, useEffect } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useLoadScript,
  CircleF,
} from "@react-google-maps/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Asset } from "@/lib/data";

// ---- Map Config ----
const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };
const INDIA_BOUNDS = {
  north: 37.5,
  south: 6.5,
  west: 68.0,
  east: 97.5,
};

// ---- Major Cities ----
const majorIndianLocations = [
  { name: "New Delhi", lat: 28.6139, lng: 77.209, type: "metro" },
  { name: "Mumbai", lat: 19.076, lng: 72.8777, type: "metro" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, type: "metro" },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, type: "metro" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, type: "metro" },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867, type: "metro" },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, type: "metro" },
  { name: "Pune", lat: 18.5204, lng: 73.8567, type: "metro" },
];

// ---- Helpers ----
const isInIndia = (lat: number, lng: number) =>
  lat >= INDIA_BOUNDS.south &&
  lat <= INDIA_BOUNDS.north &&
  lng >= INDIA_BOUNDS.west &&
  lng <= INDIA_BOUNDS.east;

const parseGeoLocation = (geoLocation?: string) => {
  if (!geoLocation) return null;
  const parts = geoLocation.split(",").map((x) => parseFloat(x.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
};

// Haversine formula (distance in km)
const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function AssetMap({ assets }: { assets: Asset[] }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showAllLocations, setShowAllLocations] = useState(true);
  const [radiusKm, setRadiusKm] = useState<number>(25);

  // ---- Filter Indian assets ----
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const coords = parseGeoLocation(a.geoLocation);
      return coords && isInIndia(coords.lat, coords.lng);
    });
  }, [assets]);

  // ---- Highlight nearby assets ----
  const nearbyAssets = useMemo(() => {
    if (!selectedLocation) return [];
    const city = majorIndianLocations.find((l) => l.name === selectedLocation);
    if (!city) return [];
    return filteredAssets.filter((asset) => {
      const coords = parseGeoLocation(asset.geoLocation);
      if (!coords) return false;
      return haversineDistanceKm(city.lat, city.lng, coords.lat, coords.lng) <= radiusKm;
    });
  }, [selectedLocation, filteredAssets, radiusKm]);

  const mapContainerStyle = useMemo(
    () => ({ width: "100%", height: "500px", borderRadius: "12px" }),
    []
  );

  if (!isLoaded) return <p>Loading map...</p>;

  // ---- Get city & nearby asset names ----
  const selectedCity = selectedLocation
    ? majorIndianLocations.find((c) => c.name === selectedLocation)
    : null;

  const assetNamesPreview = nearbyAssets.slice(0, 3).map((a) => a.name).join(", ");
  const moreCount = nearbyAssets.length > 3 ? ` +${nearbyAssets.length - 3} more` : "";

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Railway Asset Map (India)
        </CardTitle>
        <CardDescription>
          Click a city to highlight nearby railway assets within the chosen radius
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ---- Top Controls ---- */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => setShowAllLocations(!showAllLocations)}
            className={`px-3 py-1 rounded-md text-xs font-medium shadow-md transition-all ${
              showAllLocations
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {showAllLocations ? "Hide Locations" : "Show Locations"}
          </button>

          <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-md shadow-sm">
            <label className="text-[11px] text-gray-700">
              Radius: {radiusKm} km
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        {/* ---- Map ---- */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={INDIA_CENTER}
          zoom={5.5}
          options={{
            restriction: { latLngBounds: INDIA_BOUNDS, strictBounds: false },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {/* ---- Metros ---- */}
          {showAllLocations &&
            majorIndianLocations.map((loc, i) => (
              <MarkerF
                key={i}
                position={{ lat: loc.lat, lng: loc.lng }}
                title={loc.name}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor:
                    selectedLocation === loc.name ? "#F59E0B" : "#7E3AF2",
                  fillOpacity: 1,
                  scale: selectedLocation === loc.name ? 10 : 8,
                  strokeColor: "white",
                  strokeWeight: 2,
                }}
                onClick={() =>
                  setSelectedLocation(
                    selectedLocation === loc.name ? null : loc.name
                  )
                }
              />
            ))}

          {/* ---- Highlight Circle ---- */}
          {selectedCity && (
            <CircleF
              center={{ lat: selectedCity.lat, lng: selectedCity.lng }}
              radius={radiusKm * 1000}
              options={{
                strokeColor: "#F59E0B",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FBBF24",
                fillOpacity: 0.15,
              }}
            />
          )}

          {/* ---- Railway Assets ---- */}
          {filteredAssets.map((asset) => {
            const coords = parseGeoLocation(asset.geoLocation)!;
            const isHighlighted = nearbyAssets.some((a) => a.id === asset.id);
            return (
              <MarkerF
                key={asset.id}
                position={coords}
                title={asset.name}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  fillColor: asset.status === "Available" ? "#10B981" : "#EF4444",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  scale: isHighlighted ? 7 : 5,
                }}
                zIndex={isHighlighted ? 999 : 1}
                onClick={() => setSelectedMarker(asset.name)}
              />
            );
          })}

          {/* ---- InfoWindow ---- */}
          {selectedMarker && (
            <InfoWindowF
              position={
                filteredAssets
                  .map((a) => ({
                    name: a.name,
                    coords: parseGeoLocation(a.geoLocation)!,
                  }))
                  .find((a) => a.name === selectedMarker)?.coords
              }
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="text-sm font-medium">{selectedMarker}</div>
            </InfoWindowF>
          )}

          {/* ---- City Tooltip ---- */}
          {selectedCity && (
            <InfoWindowF
              position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="text-xs">
                <p className="font-semibold">{selectedCity.name}</p>
                <p>
                  Nearby assets within {radiusKm} km:
                  <br />
                  <span className="text-gray-700">
                    {assetNamesPreview || "None"} {moreCount}
                  </span>
                </p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
}
