import { Order } from '../models/order';
import { getReadyOrders } from './iikoClient';
import { assignOrderToCourier } from './oneCClient';
import pool from '../db/postgres';

/** Haversine distance in meters */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Назначает курьеру до 3 заказов: первый — самый старый ready, затем до 2 ближайших по времени и расстоянию.
 * Ограничения: разница created_at <= 10 минут, расстояние между адресами <= 1400 м.
 * Возвращает массив назначенных заказов (может быть пустым).
 */
export async function assignOrdersToCourier(courierId: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Выбираем один незназначенный заказ со статусом ready, который дольше всего на полке.
        const selectPrimary = await client.query(
            `SELECT id, delivery_lat, delivery_lng, created_at
             FROM orders
             WHERE status = 'ready' AND assigned_to IS NULL
             ORDER BY shelf_since ASC NULLS LAST, created_at ASC
             FOR UPDATE SKIP LOCKED
             LIMIT 1`
        );

        if (selectPrimary.rowCount === 0) {
            await client.query('COMMIT');
            return [];
        }

        const primary = selectPrimary.rows[0];
        const primaryId = primary.id;
        const primaryLat = primary.delivery_lat;
        const primaryLng = primary.delivery_lng;
        const primaryCreated = new Date(primary.created_at);

        // Найдём кандидатов (ограничим выборку чтобы не тянуть слишком много)
        const candidatesRes = await client.query(
            `SELECT id, delivery_lat, delivery_lng, created_at
             FROM orders
             WHERE status = 'ready' AND assigned_to IS NULL AND id <> $1
             ORDER BY created_at ASC
             FOR UPDATE SKIP LOCKED
             LIMIT 20`,
            [primaryId]
        );

        const candidates = candidatesRes.rows;

        // Фильтрация по времени и расстоянию
        const eligible: { id: string; dist: number; timeDiffMs: number }[] = [];

        for (const c of candidates) {
            if (c.delivery_lat == null || c.delivery_lng == null || primaryLat == null || primaryLng == null) {
                continue;
            }
            const created = new Date(c.created_at);
            const timeDiff = Math.abs(created.getTime() - primaryCreated.getTime());
            if (timeDiff > 10 * 60 * 1000) continue; // >10 min
            const dist = haversineMeters(primaryLat, primaryLng, c.delivery_lat, c.delivery_lng);
            if (dist > 1400) continue; // >1400 m
            eligible.push({ id: c.id, dist, timeDiffMs: timeDiff });
        }

        // Сортируем кандидатов — сначала по близости, затем по времени
        eligible.sort((a, b) => a.dist - b.dist || a.timeDiffMs - b.timeDiffMs);

        // Собираем до 2 кандидатов
        const toAssignIds = [primaryId, ...eligible.slice(0, 2).map(e => e.id)];

        // Обновляем все выбранные заказы
        await client.query(
            `UPDATE orders
             SET assigned_to = $1, assigned_at = NOW(), status = 'assigned'
             WHERE id = ANY($2::text[])`,
            [courierId, toAssignIds]
        );

        await client.query('COMMIT');

        const { rows } = await pool.query(
            `SELECT * FROM orders WHERE id = ANY($1::text[])`,
            [toAssignIds]
        );

        return rows;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}