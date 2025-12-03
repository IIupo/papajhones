import { Request, Response } from 'express';
import { Order } from '../models/order';
import { IikoClient } from '../services/iikoClient';
import { OneCClient } from '../services/oneCClient';
import { GeolocationVerifier } from '../services/geolocationVerifier';
import { Assignment } from '../services/assignment';

export class OrdersController {
    private iikoClient: IikoClient;
    private oneCClient: OneCClient;
    private geolocationVerifier: GeolocationVerifier;
    private assignment: Assignment;

    constructor() {
        this.iikoClient = new IikoClient();
        this.oneCClient = new OneCClient();
        this.geolocationVerifier = new GeolocationVerifier();
        this.assignment = new Assignment();
    }

    public async fetchOrders(req: Request, res: Response): Promise<void> {
        try {
            const orders = await this.iikoClient.getOrders();
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders', error });
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
                const isValid = await this.geolocationVerifier.verify(geolocation, order.address);
                if (!isValid) {
                    res.status(400).json({ message: 'Invalid geolocation' });
                    return;
                }
            }

            order.status = status;
            await order.save();

            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error updating order status', error });
        }
    }

    public async assignOrderToCourier(req: Request, res: Response): Promise<void> {
        const { orderId, courierId } = req.body;

        try {
            const order = await this.assignment.assign(orderId, courierId);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error assigning order', error });
        }
    }
}