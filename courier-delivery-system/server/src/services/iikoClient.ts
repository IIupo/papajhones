import axios from 'axios';

const IIKO_API_URL = 'https://api.iiko.biz/api/1/'; // Replace with the actual iiko API URL
const IIKO_API_KEY = 'YOUR_IIKO_API_KEY'; // Replace with your actual iiko API key

export const getOrders = async () => {
    try {
        const response = await axios.get(`${IIKO_API_URL}orders`, {
            headers: {
                'Authorization': `Bearer ${IIKO_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders from iiko API:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.put(`${IIKO_API_URL}orders/${orderId}`, {
            status: status
        }, {
            headers: {
                'Authorization': `Bearer ${IIKO_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${orderId} status to ${status}:`, error);
        throw error;
    }
};