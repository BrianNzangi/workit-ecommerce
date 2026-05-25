import { Search, Filter, Pencil, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface OrdersToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    statuses: string[];
    totalCount: number;
    filteredCount: number;
}

export function OrdersToolbar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    statuses,
    totalCount,
    filteredCount,
}: OrdersToolbarProps) {
    return (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[140px] rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <SelectValue placeholder="Filter" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="rounded bg-gray-50 pl-9 ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
