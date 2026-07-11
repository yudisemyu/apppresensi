// Koordinat Posko KKN Balesari
export const POSKO_LAT = -7.4205097
export const POSKO_LNG = 110.1893205
export const MAX_RADIUS_KM = 10 // Maksimal jarak absen dalam kilometer

/**
 * Menghitung jarak antara dua koordinat menggunakan formula Haversine.
 * Mengembalikan hasil dalam satuan Kilometer (km).
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function isWithinRadius(lat: number, lng: number): { valid: boolean; distance: number } {
  const distance = getDistance(POSKO_LAT, POSKO_LNG, lat, lng)
  return {
    valid: distance <= MAX_RADIUS_KM,
    distance
  }
}
