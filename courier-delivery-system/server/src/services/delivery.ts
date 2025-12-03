import pool from '../db/postgres';

const DELIVERY_RADIUS_M = 200; // настройте

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function deliverOrdersBatch(courierId: string, orderIds: string[], geo: { lat: number; lng: number }) {
    const client = await pool.connect();
    const results: { id: string; success: boolean; reason?: string }[] = [];
    try {
        await client.query('BEGIN');

        const res = await client.query(
            `SELECT id, delivery_lat, delivery_lng, assigned_to, status
             FROM orders
             WHERE id = ANY($1::text[])
             FOR UPDATE SKIP LOCKED`,
            [orderIds]
        );

        const rowsById = new Map<string, any>();
        for (const r of res.rows) rowsById.set(r.id, r);

        for (const id of orderIds) {
            const row = rowsById.get(id);
            if (!row) {
                results.push({ id, success: false, reason: 'not_found_or_locked' });
                continue;
            }

            if (row.assigned_to && row.assigned_to !== courierId) {
                results.push({ id, success: false, reason: 'assigned_to_other_courier' });
                continue;
            }

            if (row.delivery_lat == null || row.delivery_lng == null) {
                results.push({ id, success: false, reason: 'no_delivery_coords' });
                continue;
            }

            const dist = haversineMeters(geo.lat, geo.lng, Number(row.delivery_lat), Number(row.delivery_lng));
            if (dist > DELIVERY_RADIUS_M) {
                results.push({ id, success: false, reason: `too_far(${Math.round(dist)}m)` });
                continue;
            }

            await client.query(
                `UPDATE orders
                 SET status = 'delivered',
                     delivered_at = NOW(),
                     delivered_by = $1,
                     delivered_lat = $2,
                     delivered_lng = $3,
                     delivered_synced_1c = false,
                     delivered_synced_iiko = false,
                     last_sync_attempt = NULL,
                     sync_error = NULL
                 WHERE id = $4`,
                [courierId, geo.lat, geo.lng, id]
            );

            results.push({ id, success: true });
        }

        await client.query('COMMIT');
        return results;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}