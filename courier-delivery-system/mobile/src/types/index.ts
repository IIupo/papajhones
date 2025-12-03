export interface Order {
    id: string;
    status: 'pending' | 'ready' | 'delivered';
    address: string;
    courierId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Courier {
    id: string;
    name: string;
    phone: string;
}

export interface Geolocation {
    latitude: number;
    longitude: number;
}

export interface DeliveryUpdate {
    orderId: string;
    geolocation: Geolocation;
}

export interface OrderStatusUpdate {
    orderId: string;
    status: 'at_restaurant' | 'delivered';
}