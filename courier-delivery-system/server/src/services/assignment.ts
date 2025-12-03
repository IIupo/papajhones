import pool, { PgClient } from '../db/postgres';

/** Haversine used for selection in assignment code (exported for tests if needed) */
export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export type OrderRow = {
    id: string;
    delivery_lat?: number | null;
    delivery_lng?: number | null;
    created_at: string;
    [k: string]: any;
};

/**
 * Назначает курьеру до 3 заказов — первичный + до 2 кандидатов по time/distance.
 */
export async function assignOrdersToCourier(courierId: string): Promise<OrderRow[]> {
    if (!courierId) throw new Error('missing courierId');
    const client: PgClient = await pool.connect();
    try {
        await client.query('BEGIN');

        const primaryRes = await client.query<OrderRow>(
            `SELECT id, delivery_lat, delivery_lng, created_at
             FROM orders
             WHERE status = 'ready' AND assigned_to IS NULL
             ORDER BY COALESCE(shelf_since, created_at) ASC
             FOR UPDATE SKIP LOCKED
             LIMIT 1`
        );

        if (primaryRes.rowCount === 0) {
            await client.query('COMMIT');
            return [];
        }

        const primary = primaryRes.rows[0];
        const primaryId = primary.id;
        const primaryLat = primary.delivery_lat;
        const primaryLng = primary.delivery_lng;
        const primaryCreated = new Date(primary.created_at);

        const candidatesRes = await client.query<OrderRow>(
            `SELECT id, delivery_lat, delivery_lng, created_at
             FROM orders
             WHERE status = 'ready' AND assigned_to IS NULL AND id <> $1
             ORDER BY created_at ASC
             FOR UPDATE SKIP LOCKED
             LIMIT 50`,
            [primaryId]
        );

        const eligible: { id: string; dist: number; timeDiffMs: number }[] = [];

        for (const c of candidatesRes.rows) {
            if (c.delivery_lat == null || c.delivery_lng == null || primaryLat == null || primaryLng == null) continue;
            const created = new Date(c.created_at);
            const timeDiff = Math.abs(created.getTime() - primaryCreated.getTime());
            if (timeDiff > 10 * 60 * 1000) continue;
            const dist = haversineMeters(primaryLat, primaryLng, c.delivery_lat, c.delivery_lng);
            if (dist > 1400) continue;
            eligible.push({ id: c.id, dist, timeDiffMs: timeDiff });
        }

        eligible.sort((a, b) => a.dist - b.dist || a.timeDiffMs - b.timeDiffMs);

        const toAssignIds = [primaryId, ...eligible.slice(0, 2).map(e => e.id)];

        await client.query(
            `UPDATE orders
             SET assigned_to = $1, assigned_at = NOW(), status = 'assigned'
             WHERE id = ANY($2::text[])`,
            [courierId, toAssignIds]
        );

        await client.query('COMMIT');

        const { rows } = await pool.query(`SELECT * FROM orders WHERE id = ANY($1::text[])`, [toAssignIds]);
        return rows;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}