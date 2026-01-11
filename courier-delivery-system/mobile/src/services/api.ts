import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://your-server-url/api'; // set via .env in real env
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

type Geo = { lat: number; lng: number };

// Helper: convert client location { latitude, longitude } to server Geo { lat, lng }
function toServerGeo(loc: { latitude: number; longitude: number } | { lat: number; lng: number } | null): Geo | null {
    if (!loc) return null as any;
    if ((loc as any).latitude !== undefined) return { lat: (loc as any).latitude, lng: (loc as any).longitude };
    return (loc as any) as Geo;
}

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

export const getOrderDetails = async (orderId: string) => {
    if (!orderId) throw new Error('missing orderId');
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

export const getOrderLocation = async (orderId: string) => {
    const details = await getOrderDetails(orderId);
    // Expect server returns delivery_lat/delivery_lng or delivered_lat/delivered_lng
    const lat = details.delivery_lat ?? details.delivered_lat ?? details.lat ?? null;
    const lng = details.delivery_lng ?? details.delivered_lng ?? details.lng ?? null;
    if (lat == null || lng == null) return null;
    return { latitude: Number(lat), longitude: Number(lng) };
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

// Backwards-compatible wrapper expected by screens: markAsDelivered(orderId, location)
export const markAsDelivered = async (orderId: string, location: { latitude: number; longitude: number } | null) => {
    if (!orderId || !location) throw new Error('invalid args');
    const geo = toServerGeo(location);
    if (!geo) throw new Error('invalid location format');
    try {
        // POST single-order deliver endpoint
        const response = await axiosInstance.post(`/orders/${orderId}/deliver`, { geolocation: geo });
        return response.data;
    } catch (error) {
        console.error('Error marking as delivered:', error);
        throw error;
    }
};

export const markAtRestaurant = async (orderId: string) => {
    if (!orderId) throw new Error('missing orderId');
    try {
        const response = await axiosInstance.post(`/orders/${orderId}/at-restaurant`);
        return response.data;
    } catch (error) {
        console.error('Error marking at restaurant:', error);
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

// Generic update helper used by OrdersList: updateOrderStatus(orderId, status, location?)
export const updateOrderStatus = async (orderId: string, status: string, location?: { latitude: number; longitude: number } | null) => {
    if (!orderId || !status) throw new Error('invalid args');
    if (status === 'delivered') {
        return await markAsDelivered(orderId, location ?? null);
    }
    if (status === 'at_restaurant' || status === 'at-restaurant') {
        return await markAtRestaurant(orderId);
    }
    // Fallback: call a generic endpoint
    try {
        const resp = await axiosInstance.post(`/orders/${orderId}/status`, { status });
        return resp.data;
    } catch (err) {
        console.error('Error updating order status:', err);
        throw err;
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