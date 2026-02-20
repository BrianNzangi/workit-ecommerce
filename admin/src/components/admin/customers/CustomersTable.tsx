import { Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CustomerRecord } from './types';
import { formatDate, getCustomerInitials, getCustomerName } from './customers-utils';

interface CustomersTableProps {
    customers: CustomerRecord[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
    return (
        <Card className="overflow-hidden border-gray-200 shadow-xs">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                Customer
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                Contact
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                Registered
                            </TableHead>
                            <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">
                                Status
                            </TableHead>
                            <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => {
                            const enabled = customer.enabled !== false;
                            return (
                                <TableRow key={customer.id} className="group">
                                    <TableCell className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-primary-50 font-bold uppercase text-primary-900 transition-colors group-hover:bg-primary-900 group-hover:text-white">
                                                {getCustomerInitials(customer)}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-gray-900">
                                                    {getCustomerName(customer)}
                                                </p>
                                                <p className="mt-0.5 text-xs font-bold text-gray-400">
                                                    ID: {customer.id.slice(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm font-medium text-gray-600">
                                                <Mail className="mr-2 h-3.5 w-3.5 text-gray-300" />
                                                {customer.email}
                                            </div>
                                            {customer.phoneNumber ? (
                                                <div className="flex items-center text-sm font-medium text-gray-600">
                                                    <Phone className="mr-2 h-3.5 w-3.5 text-gray-300" />
                                                    {customer.phoneNumber}
                                                </div>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex items-center text-sm font-medium text-gray-600">
                                            <Calendar className="mr-2 h-3.5 w-3.5 text-gray-300" />
                                            {formatDate(customer.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <Badge
                                            variant={enabled ? 'success' : 'error'}
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${enabled ? '' : 'border-red-100 bg-red-50 text-red-700'}`}
                                        >
                                            {enabled ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="h-8 border-primary-200 text-primary-900 hover:bg-primary-50 hover:text-primary-900"
                                        >
                                            <Link href={`/admin/customers/${customer.id}/edit`}>
                                                Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
