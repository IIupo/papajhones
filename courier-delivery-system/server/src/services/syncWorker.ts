import pool from '../db/postgres';
import axios from 'axios';

const SYNC_BATCH = 20;
const SYNC_INTERVAL_MS = 15_000; // кажд. 15s, настройте
const ONEC_ENDPOINT = process.env.ONEC_ENDPOINT || 'https://1c.example.com/api/syncOrder';
const IIKO_ENDPOINT = process.env.IIKO_ENDPOINT || 'https://iiko.example.com/api/syncOrder';
const ONEC_TOKEN = process.env.ONEC_TOKEN || '';
const IIKO_TOKEN = process.env.IIKO_TOKEN || '';

async function syncOrderTo1C(order: any) {
    // Пример вызова 1С — адаптируйте под ваш API
    const payload = {
        id: order.id,
        delivered_at: order.delivered_at,
        delivered_by: order.delivered_by,
        coords: { lat: order.delivered_lat, lng: order.delivered_lng },
    };
    const resp = await axios.post(ONEC_ENDPOINT, payload, {
        headers: { Authorization: `Bearer ${ONEC_TOKEN}` },
        timeout: 10000,
    });
    return resp.status >= 200 && resp.status < 300;
}

async function syncOrderToIIKO(order: any) {
    const payload = {
        orderId: order.external_iiko_id || order.id,
        status: 'delivered',
        deliveredAt: order.delivered_at,
    };
    const resp = await axios.post(IIKO_ENDPOINT, payload, {
        headers: { Authorization: `Bearer ${IIKO_TOKEN}` },
        timeout: 10000,
    });
    return resp.status >= 200 && resp.status < 300;
}

export async function runSyncWorker() {
    console.log('syncWorker started');
    while (true) {
        let client;
        try {
            client = await pool.connect();
            await client.query('BEGIN');

            // Берём batch доставленных заказов, которые ещё не синхронизированы
            const { rows } = await client.query(
                `SELECT id, delivered_at, delivered_by, delivered_lat, delivered_lng, external_iiko_id
                 FROM orders
                 WHERE status = 'delivered' AND (delivered_synced_1c = false OR delivered_synced_iiko = false)
                 ORDER BY delivered_at ASC
                 FOR UPDATE SKIP LOCKED
                 LIMIT $1`,
                [SYNC_BATCH]
            );

            if (rows.length === 0) {
                await client.query('COMMIT');
                client.release();
                await new Promise(r => setTimeout(r, SYNC_INTERVAL_MS));
                continue;
            }

            for (const order of rows) {
                const update: { delivered_synced_1c?: boolean; delivered_synced_iiko?: boolean; last_sync_attempt?: Date; sync_error?: string } = {};
                try {
                    // синхронизируем в 1С
                    try {
                        const ok1 = await syncOrderTo1C(order);
                        update.delivered_synced_1c = !!ok1;
                    } catch (e) {
                        update.delivered_synced_1c = false;
                        throw new Error(`1C sync error: ${e?.message || e}`);
                    }

                    // синхронизируем в iiko
                    try {
                        const ok2 = await syncOrderToIIKO(order);
                        update.delivered_synced_iiko = !!ok2;
                    } catch (e) {
                        update.delivered_synced_iiko = false;
                        throw new Error(`iiko sync error: ${e?.message || e}`);
                    }

                    update.last_sync_attempt = new Date();
                    update.sync_error = null;

                } catch (syncErr) {
                    update.last_sync_attempt = new Date();
                    update.sync_error = String(syncErr.message || syncErr);
                }

                await client.query(
                    `UPDATE orders
                     SET delivered_synced_1c = COALESCE($2, delivered_synced_1c),
                         delivered_synced_iiko = COALESCE($3, delivered_synced_iiko),
                         last_sync_attempt = $4,
                         sync_error = $5
                     WHERE id = $1`,
                    [order.id, update.delivered_synced_1c ?? null, update.delivered_synced_iiko ?? null, update.last_sync_attempt, update.sync_error]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            console.error('syncWorker loop error', err);
            try { if (client) await client.query('ROLLBACK'); } catch {}
        } finally {
            try { if (client) client.release(); } catch {}
        }

        await new Promise(r => setTimeout(r, SYNC_INTERVAL_MS));
    }
}

// Если запускаете напрямую: node -r ts-node/register src/services/syncWorker.ts
if (require.main === module) {
    runSyncWorker().catch(err => {
        console.error('syncWorker fatal', err);
        process.exit(1);
    });
}