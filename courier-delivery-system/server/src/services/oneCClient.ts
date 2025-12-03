import axios from 'axios';

const ONE_C_API_URL = 'https://your-onec-api-url.com'; // Replace with your actual 1C API URL

export const syncOrdersWithOneC = async (orders) => {
    try {
        const response = await axios.post(`${ONE_C_API_URL}/sync-orders`, { orders });
        return response.data;
    } catch (error) {
        console.error('Error syncing orders with 1C:', error);
        throw error;
    }
};

export const fetchOrdersFromOneC = async () => {
    try {
        const response = await axios.get(`${ONE_C_API_URL}/orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders from 1C:', error);
        throw error;
    }
};