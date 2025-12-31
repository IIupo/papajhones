import { Request, Response } from 'express';
import Order from '../models/order';
import * as iikoClient from '../services/iikoClient';
import * as oneCClient from '../services/oneCClient';
import { verifyGeolocation } from '../services/geolocationVerifier';
import { assignOrdersToCourier } from '../services/assignment';

export class OrdersController {
    public async fetchOrders(req: Request, res: Response): Promise<void> {
        try {
            const orders = await iikoClient.getOrders();
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders', error: String(error) });
        }
    }

    public async updateOrderStatus(req: Request, res: Response): Promise<void> {
        const { orderId, status, geolocation } = req.body;
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }

            if (status === 'delivered') {
                // expect geolocation: { lat, lng }
                const isValid = verifyGeolocation({ lat: geolocation?.lat, lng: geolocation?.lng }, { lat: order.deliveryLat as number, lng: order.deliveryLng as number });
                if (!isValid) {
                    res.status(400).json({ message: 'Invalid geolocation' });
                    return;
                }
            }

            order.status = status;
            await order.save();
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error updating order status', error: String(error) });
        }
    }

    public async assignOrderToCourier(req: Request, res: Response): Promise<void> {
        const { courierId } = req.body;
        try {
            const assigned = await assignOrdersToCourier(courierId);
            res.status(200).json({ assigned });
        } catch (error) {
            res.status(500).json({ message: 'Error assigning orders', error: String(error) });
        }
    }
}