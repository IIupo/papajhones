// Lightweight Order model type for server-side logic (DB is Postgres)
export type Order = {
    id: string;
    external_iiko_id?: string | null;
    status: 'pending' | 'ready' | 'assigned' | 'delivered' | 'at_restaurant' | string;
    deliveryLat?: number | null;
    deliveryLng?: number | null;
    assigned_to?: string | null;
    created_at?: string | null;
    [k: string]: any;
};

export default {} as any;