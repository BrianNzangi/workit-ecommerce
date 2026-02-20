import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';

interface CustomersToolbarProps {
    searchTerm: string;
    totalCustomers: number;
    filteredCustomers: number;
    onSearchTermChange: (value: string) => void;
}

export function CustomersToolbar({
    searchTerm,
    totalCustomers,
    filteredCustomers,
    onSearchTermChange,
}: CustomersToolbarProps) {
    return (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                    placeholder="Search customers by name, email or phone"
                    className="pl-9"
                />
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary-200 bg-primary-50 text-primary-900">
                    {filteredCustomers} showing
                </Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {totalCustomers} total
                </Badge>
            </div>
        </div>
    );
}
