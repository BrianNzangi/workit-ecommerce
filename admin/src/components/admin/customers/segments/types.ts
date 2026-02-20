export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    customerCount: number;
    percentage: number;
    source: 'auto';
}
