import axios from 'axios';

const ONE_C_API_URL = process.env.ONEC_API_URL || 'https://your-onec-api-url.com';

export async function syncOrdersWithOneC(orders: any[]): Promise<any> {
    const resp = await axios.post(`${ONE_C_API_URL}/sync-orders`, { orders });
    return resp.data;
}

export async function fetchOrdersFromOneC(): Promise<any> {
    const resp = await axios.get(`${ONE_C_API_URL}/orders`);
    return resp.data;
}