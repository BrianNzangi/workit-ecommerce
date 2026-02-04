export interface InitializePaymentInput {
    orderId: string;
    email: string;
    amount: number; // In cents
    callbackUrl?: string;
}

export interface InitializePaymentResponse {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
}
