export interface CustomerRecord {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    createdAt: string;
    enabled?: boolean;
    location?: string;
    ordersCount?: number;
    totalSpent?: number;
}

export interface OrderRecord {
    id: string;
    customerId: string;
    state?: string;
    createdAt: string;
}
