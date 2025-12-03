import { geolib } from 'geolib';
import { Order } from '../models/order';

export const verifyGeolocation = async (orderId: string, courierLocation: { latitude: number; longitude: number }): Promise<boolean> => {
    const order: Order | null = await Order.findById(orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    const orderAddressLocation = {
        latitude: order.address.latitude,
        longitude: order.address.longitude,
    };

    const distance = geolib.getDistance(courierLocation, orderAddressLocation);

    // Assuming a threshold of 150 meters for delivery confirmation
    const threshold = 150;

    return distance <= threshold;
};