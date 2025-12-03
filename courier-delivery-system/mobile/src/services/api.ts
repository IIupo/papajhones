import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://your-server-url/api'; // set via .env in real env
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

type Geo = { lat: number; lng: number };

/**
 * Получить список заказов для курьера
 */
export const fetchOrders = async (courierId: string) => {
    if (!courierId) throw new Error('missing courierId');
    try {
        const response = await axiosInstance.get('/orders', { params: { courierId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

/**
 * Отметить один заказ доставленным.
 * Передаёт courierId + геолокацию.
 */
export const markOrderAsDelivered = async (orderId: string, courierId: string, geolocation: Geo) => {
    if (!orderId || !courierId || !geolocation) throw new Error('invalid args');
    try {
        const response = await axiosInstance.post(`/orders/${orderId}/deliver`, {
            courierId,
            geolocation,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        throw error;
    }
};

/**
 * Alias: курьер нажал "в ресторане".
 * Сервер выберет и вернёт назначенные заказы.
 */
export const setCourierAtRestaurant = async (courierId: string) => {
    if (!courierId) throw new Error('missing courierId');
    try {
        const response = await axiosInstance.post(`/couriers/${courierId}/at-restaurant`);
        return response.data; // { orders: [...] } или 204
    } catch (error) {
        console.error('Error setting courier at restaurant:', error);
        throw error;
    }
};

/**
 * Поддерживается для совместимости — wrapper, если где-то вызывается markOrderAtRestaurant
 * раньше с courierId.
 */
export const markOrderAtRestaurant = setCourierAtRestaurant;

/**
 * Пометить несколько заказов доставленными (batch).
 * Теперь обязательно передаём courierId.
 */
export const markOrdersAsDelivered = async (orderIds: string[], courierId: string, geolocation: Geo) => {
    if (!Array.isArray(orderIds) || !courierId || !geolocation) throw new Error('invalid args');
    try {
        const response = await axiosInstance.post(`/orders/deliver-batch`, {
            courierId,
            orderIds,
            geolocation,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking orders as delivered:', error);
        throw error;
    }
};

/**
 * Курьер вернулся в ресторан — завершил маршрут / очистка состояния.
 */
export const setCourierReturnedToRestaurant = async (courierId: string) => {
    if (!courierId) throw new Error('missing courierId');
    try {
        const response = await axiosInstance.post(`/couriers/${courierId}/return-to-restaurant`);
        return response.data;
    } catch (error) {
        console.error('Error setting courier returned to restaurant:', error);
        throw error;
    }
};