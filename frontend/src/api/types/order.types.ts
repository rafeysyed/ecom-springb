export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// ---- Requests ----

export interface PlaceOrderItemRequest {
    productId: string;
    quantity: number;
}

export interface PlaceOrderRequest {
    userId: string;
    items: PlaceOrderItemRequest[];
}

// ---- Responses ----

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    orderId: string;
    userId: string;
    totalPrice: number;
    status: OrderStatus;
    items: OrderItem[];
}