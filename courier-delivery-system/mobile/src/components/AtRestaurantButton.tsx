import React from 'react';
import { Button, Alert } from 'react-native';
import { updateOrderStatus } from '../services/api';

type Order = {
    id: string;
    status: string;
    [key: string]: any;
};

type SetOrders = (updater: (prev: Order[]) => Order[]) => void;

/**
 * Lightweight fallback hook for useOrderContext used in isolated components/tests.
 * Replace with the real context hook import when integrating into the app.
 */
function useOrderContext(): { setOrders: SetOrders } {
    const setOrders = React.useCallback((updater: (prev: Order[]) => Order[]) => {
        // No-op fallback: log the update for debugging in development
        try {
            const result = updater([]);
            // eslint-disable-next-line no-console
            console.warn('useOrderContext (fallback) setOrders called, result:', result);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('useOrderContext (fallback) setOrders called with error', e);
        }
    }, []);

    return { setOrders };
}

const AtRestaurantButton = ({ orderId }) => {
    const { setOrders } = useOrderContext();

    const handleAtRestaurant = async () => {
        try {
            const response = await updateOrderStatus(orderId, 'at_restaurant');
            if (response.success) {
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId ? { ...order, status: 'at_restaurant' } : order
                    )
                );
                Alert.alert('Success', 'Order status updated to "At Restaurant"');
            } else {
                Alert.alert('Error', 'Failed to update order status');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while updating the order status');
        }
    };

    return (
        <Button title="At Restaurant" onPress={handleAtRestaurant} />
    );
};

export default AtRestaurantButton;