import axios from 'axios';

const API_BASE_URL = 'http://your-server-url/api'; // Replace with your server URL

export const fetchOrders = async (courierId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders`, {
            params: { courierId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const markOrderAsDelivered = async (orderId, geolocation) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/deliver`, {
            geolocation,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        throw error;
    }
};

export const markOrderAtRestaurant = async (orderId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/at-restaurant`);
        return response.data;
    } catch (error) {
        console.error('Error marking order at restaurant:', error);
        throw error;
    }
};

// Добавлено: отметить курьера "в ресторане" — сервер попытается назначить заказ
export const setCourierAtRestaurant = async (courierId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/couriers/${courierId}/at-restaurant`);
        return response.data; // вернёт назначённые заказ(ы) или 204
    } catch (error) {
        console.error('Error setting courier at restaurant:', error);
        throw error;
    }
};

// Новое: пометить несколько заказов как доставленные (отправляет геолокацию + список id)
export const markOrdersAsDelivered = async (orderIds, geolocation) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders/deliver-batch`, {
            orderIds,
            geolocation,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking orders as delivered:', error);
        throw error;
    }
};

// Новое: курьер вернулся в ресторан (заканчивает маршрут, можно использовать для логики очистки/синхронизации)
export const setCourierReturnedToRestaurant = async (courierId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/couriers/${courierId}/return-to-restaurant`);
        return response.data;
    } catch (error) {
        console.error('Error setting courier returned to restaurant:', error);
        throw error;
    }
};