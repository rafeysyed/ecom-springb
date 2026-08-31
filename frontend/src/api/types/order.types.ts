export type OrderStatus =
    | 'CREATED'
    | 'PENDING'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_COMPLETED'
    | 'PAID'
    | 'CONFIRMED'
    | 'FAILED'
    | 'CANCELLED'
    | 'SHIPPED'
    | 'DELIVERED';

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
    price?: number;
}

export interface Order {
    orderId: string;
    userId: string;
    totalAmount?: number;
    totalPrice?: number;
    status: OrderStatus;
    createdAt?: string;
    items: OrderItem[];
}