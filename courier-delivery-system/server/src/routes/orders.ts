import express from 'express';
import { deliverOrdersBatch } from '../services/delivery';

const router = express.Router();

/**
 * POST /api/orders/deliver-batch
 * body: { courierId: string, orderIds: string[], geolocation: { lat: number, lng: number } }
 */
router.post('/deliver-batch', async (req, res) => {
  const { courierId, orderIds, geolocation } = req.body;
  if (!courierId || !Array.isArray(orderIds) || !geolocation || typeof geolocation.lat !== 'number' || typeof geolocation.lng !== 'number') {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  try {
    const results = await deliverOrdersBatch(courierId, orderIds, geolocation);
    return res.json({ results });
  } catch (err) {
    console.error('deliver-batch error', err);
    return res.status(500).json({ error: 'delivery_error' });
  }
});

export default router;