/** Standort holen (Browser Geolocation) + Reverse-Geocoding via Nominatim. */

export interface GeoResult {
  locationText: string;
  lat: number;
  lng: number;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Standort nicht verfügbar."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

/** Kürzt die Nominatim-Adresse auf "Straße, Ort" o. ä. */
function shortAddress(addr: Record<string, string> | undefined, fallback: string): string {
  if (!addr) return fallback;
  const line1 = [addr.road, addr.house_number].filter(Boolean).join(" ");
  const place = addr.city || addr.town || addr.village || addr.municipality || addr.county;
  const parts = [line1 || addr.amenity || addr.suburb, place].filter(Boolean);
  return parts.length ? parts.join(", ") : fallback;
}

export async function getCurrentLocation(): Promise<GeoResult> {
  const pos = await getPosition();
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  let locationText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "de" } },
    );
    if (res.ok) {
      const data = await res.json();
      locationText = shortAddress(data.address, data.display_name ?? locationText);
    }
  } catch {
    // Fallback: Koordinaten
  }

  return { locationText, lat, lng };
}
