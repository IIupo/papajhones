import axios from 'axios';

const IIKO_API_URL = process.env.IIKO_API_URL || 'https://api.iiko.biz/api/1/';
const IIKO_API_KEY = process.env.IIKO_API_KEY || '';

export async function getOrders(): Promise<any> {
    const resp = await axios.get(`${IIKO_API_URL}orders`, { headers: { Authorization: `Bearer ${IIKO_API_KEY}` } });
    return resp.data;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
    const resp = await axios.put(`${IIKO_API_URL}orders/${orderId}`, { status }, { headers: { Authorization: `Bearer ${IIKO_API_KEY}` } });
    return resp.data;
}