import { apiClient } from '@/api/client';
import type {
    PaymentProcessRequest,
    PaymentProcessResponse,
    Confirm3dsRequest,
    RefundRequest,
    RefundResponse
} from '@/api/types/payment.types';

export async function processPayment(payload: PaymentProcessRequest): Promise<PaymentProcessResponse> {
    const headers: Record<string, string> = {};
    if (payload.idempotencyKey) {
        headers['Idempotency-Key'] = payload.idempotencyKey;
    }
    const { data } = await apiClient.post<PaymentProcessResponse>('/payments/process', payload, { headers });
    return data;
}

export async function confirm3ds(payload: Confirm3dsRequest): Promise<PaymentProcessResponse> {
    const { data } = await apiClient.post<PaymentProcessResponse>('/payments/confirm-3ds', payload);
    return data;
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentProcessResponse> {
    const { data } = await apiClient.get<PaymentProcessResponse>(`/payments/order/${orderId}`);
    return data;
}

export async function refundPayment(payload: RefundRequest): Promise<RefundResponse> {
    const { data } = await apiClient.post<RefundResponse>('/payments/refund', payload);
    return data;
}
