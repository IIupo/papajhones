export interface Order {
    id: string;
    status: 'pending' | 'ready' | 'delivered' | 'at_restaurant';
    address: string;
    courierId?: string;
    createdAt: Date;
    updatedAt: Date;
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

export interface DeliveryConfirmation {
    orderId: string;
    geolocation: Geolocation;
}

export interface AtRestaurantStatus {
    orderId: string;
    courierId: string;
}