import express from 'express';
import pool from '../db/postgres';
import { assignOrdersToCourier } from '../services/assignment';

const router = express.Router();

// Курьер нажал "в ресторане" — пометить его и попытаться назначить заказ(ы)
router.post('/:id/at-restaurant', async (req, res) => {
    const courierId = req.params.id;
    try {
        await pool.query(
            `UPDATE couriers SET at_restaurant = TRUE, last_seen = NOW() WHERE id = $1`,
            [courierId]
        );

        const assignedOrders = await assignOrdersToCourier(courierId);

        if (!assignedOrders || assignedOrders.length === 0) {
            return res.status(204).send();
        }

        // Вернём назначенные заказы (массив)
        return res.json({ orders: assignedOrders });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'assignment_error' });
    }
});

// Курьер вернулся в ресторан — пометить, можно использовать для завершения смены/логики
router.post('/:id/return-to-restaurant', async (req, res) => {
    const courierId = req.params.id;
    try {
        await pool.query(
            `UPDATE couriers SET at_restaurant = TRUE, last_seen = NOW() WHERE id = $1`,
            [courierId]
        );
        // Дополнительная логика: можно пометить завершение маршрута, синхронизировать статусы и т.д.
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'return_error' });
    }
});

export default router;