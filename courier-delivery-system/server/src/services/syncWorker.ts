import pool from '../db/postgres';
import axios from 'axios';

const SYNC_BATCH = 20;
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS) || 15_000;
const ONEC_ENDPOINT = process.env.ONEC_ENDPOINT || '';
const IIKO_ENDPOINT = process.env.IIKO_ENDPOINT || '';
const ONEC_TOKEN = process.env.ONEC_TOKEN || '';
const IIKO_TOKEN = process.env.IIKO_TOKEN || '';

async function syncOrderTo1C(order: any): Promise<boolean> {
  if (!ONEC_ENDPOINT) return false;
  const payload = { id: order.id, delivered_at: order.delivered_at, delivered_by: order.delivered_by, coords: { lat: order.delivered_lat, lng: order.delivered_lng } };
  const resp = await axios.post(ONEC_ENDPOINT, payload, { headers: { Authorization: `Bearer ${ONEC_TOKEN}` }, timeout: 10000 });
  return resp.status >= 200 && resp.status < 300;
}

async function syncOrderToIIKO(order: any): Promise<boolean> {
  if (!IIKO_ENDPOINT) return false;
  const payload = { orderId: order.external_iiko_id || order.id, status: 'delivered', deliveredAt: order.delivered_at };
  const resp = await axios.post(IIKO_ENDPOINT, payload, { headers: { Authorization: `Bearer ${IIKO_TOKEN}` }, timeout: 10000 });
  return resp.status >= 200 && resp.status < 300;
}

export async function runSyncWorker(): Promise<void> {
  console.log('syncWorker started');
  while (true) {
    let client: any = null;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const { rows } = await client.query(
        `SELECT id, delivered_at, delivered_by, delivered_lat, delivered_lng, external_iiko_id
         FROM orders
         WHERE status = 'delivered' AND (delivered_synced_1c = false OR delivered_synced_iiko = false)
         ORDER BY delivered_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT $1`,
        [SYNC_BATCH]
      );

      if (!rows || rows.length === 0) {
        await client.query('COMMIT');
        client.release();
        await new Promise(r => setTimeout(r, SYNC_INTERVAL_MS));
        continue;
      }

      for (const order of rows) {
        const update: { delivered_synced_1c?: boolean; delivered_synced_iiko?: boolean; last_sync_attempt?: Date; sync_error?: string | null } = {};
        try {
          try {
            update.delivered_synced_1c = await syncOrderTo1C(order);
          } catch (e: any) {
            update.delivered_synced_1c = false;
            throw new Error(`1C sync error: ${e?.message || String(e)}`);
          }

          try {
            update.delivered_synced_iiko = await syncOrderToIIKO(order);
          } catch (e: any) {
            update.delivered_synced_iiko = false;
            throw new Error(`iiko sync error: ${e?.message || String(e)}`);
          }

          update.last_sync_attempt = new Date();
          update.sync_error = null;
        } catch (syncErr: any) {
          update.last_sync_attempt = new Date();
          update.sync_error = String(syncErr?.message || syncErr || 'unknown');
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
      try { if (client) await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
    } finally {
      try { if (client) client.release(); } catch (e) { /* ignore */ }
    }

    await new Promise(r => setTimeout(r, SYNC_INTERVAL_MS));
  }
}

// If run directly
if (require.main === module) {
  runSyncWorker().catch(err => { console.error('syncWorker fatal', err); process.exit(1); });
}
