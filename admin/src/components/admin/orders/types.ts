export interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
}
