export type PaymentMethod = 'CARD' | 'UPI' | 'COD';

export interface PaymentProcessRequest {
    orderId: string;
    userId: string;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    cardNumber?: string;
    cardExpiry?: string;
    cvv?: string;
    cardHolderName?: string;
    vpa?: string;
    idempotencyKey?: string;
}

export interface PaymentProcessResponse {
    paymentId: string;
    orderId: string;
    status: 'SUCCESS' | 'FAILED' | 'REQUIRES_ACTION' | 'TIMED_OUT' | 'CANCELLED';
    transactionReference?: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    failureReason?: string;
    failureCode?: string;
    message?: string;
    otpChallengeRequired?: boolean;
    challengeId?: string;
}

export interface Confirm3dsRequest {
    orderId: string;
    otp: string;
}

export interface RefundRequest {
    orderId: string;
    amount?: number;
    reason?: string;
}

export interface RefundResponse {
    refundId: string;
    orderId: string;
    paymentId: string;
    amountRefunded: number;
    totalRefunded: number;
    remainingAmount: number;
    status: string;
    paymentStatus: string;
    message: string;
}
