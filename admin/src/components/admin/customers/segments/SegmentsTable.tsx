import { useMemo, useState } from 'react';
import { Copy, Download, MoreVertical, Play, Type } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CustomerSegment } from './types';

interface SegmentsTableProps {
    segments: CustomerSegment[];
}

export function SegmentsTable({ segments }: SegmentsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const allSelected = useMemo(
        () => segments.length > 0 && segments.every((segment) => selectedIds.includes(segment.id)),
        [segments, selectedIds]
    );

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(segments.map((segment) => segment.id));
    };

    const toggleSelectOne = (segmentId: string) => {
        setSelectedIds((previous) =>
            previous.includes(segmentId)
                ? previous.filter((id) => id !== segmentId)
                : [...previous, segmentId]
        );
    };

    const handleAction = (action: string, segmentName: string) => {
        toast({
            title: `${action} action`,
            description: `${segmentName}: this action can be connected to your workflow next.`,
            variant: 'success',
        });
    };

    return (
        <Card className="overflow-hidden border-gray-200 shadow-xs">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-12 px-4">
                                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                            <TableHead className="w-32 text-xs uppercase tracking-wider">% of customers</TableHead>
                            <TableHead className="w-40 text-xs uppercase tracking-wider">Customers</TableHead>
                            <TableHead className="w-28 text-xs uppercase tracking-wider">Source</TableHead>
                            <TableHead className="w-16 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {segments.map((segment) => (
                            <TableRow key={segment.id}>
                                <TableCell className="px-4">
                                    <Checkbox
                                        checked={selectedIds.includes(segment.id)}
                                        onCheckedChange={() => toggleSelectOne(segment.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium text-gray-900">{segment.name}</p>
                                    <p className="text-xs text-gray-500">{segment.description}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="font-semibold text-primary-900">{segment.percentage}%</p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-gray-700">{segment.customerCount}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-primary-200 bg-primary-50 text-primary-900">
                                        Auto
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('Use segment', segment.name)}>
                                                <Play className="h-4 w-4" />
                                                Use segment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('Duplicate', segment.name)}>
                                                <Copy className="h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('Export', segment.name)}>
                                                <Download className="h-4 w-4" />
                                                Export
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction('Rename', segment.name)}>
                                                <Type className="h-4 w-4" />
                                                Rename
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
