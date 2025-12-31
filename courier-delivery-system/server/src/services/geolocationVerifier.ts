// Small local haversine implementation to avoid external geolib typings issues
const toRad = (v: number) => (v * Math.PI) / 180;
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Compare two coord pairs { lat, lng } → boolean
export function verifyGeolocation(courier: { lat: number; lng: number } | null, target: { lat: number; lng: number } | null): boolean {
        if (!courier || !target) return false;
        const distance = haversineMeters(courier.lat, courier.lng, target.lat, target.lng);
        const threshold = Number(process.env.GEO_THRESHOLD_M) || 150;
        return distance <= threshold;
}