"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/card";
import { Plus, Search, Trash2, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type FlashSale = {
    id: string;
    title: string;
    discount: number;
    startDate: string;
    endDate: string;
    status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    productIds: string[];
    createdAt: string;
};

export default function FlashSalesPage() {
    const router = useRouter();
    const [sales, setSales] = useState<FlashSale[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchSales = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/promotions/flash-sales/admin?${params}`);
            const data = await res.json();
            if (data.success) setSales(data.flashSales);
        } catch {
            toast({ title: "Error", description: "Failed to fetch flash sales", variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/promotions/flash-sales/admin/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: "Flash sale removed", variant: "success" });
                fetchSales();
            }
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "error" });
        }
    };

    const statusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            DRAFT: "secondary",
            ACTIVE: "default",
            COMPLETED: "outline",
            CANCELLED: "destructive",
        };
        return <Badge variant={variants[status] || "outline"} className="rounded-sm">{status}</Badge>;
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Flash Sales</h1>
                        <Button onClick={() => router.push("/admin/promotions/flash-sales/new")} className="rounded-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Flash Sale
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search flash sales..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-sm"
                            />
                        </div>
                        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                            <DrawerTrigger asChild>
                                <Button variant="outline" className="rounded-sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>Filter Flash Sales</DrawerTitle>
                                    <DrawerDescription>Narrow down your flash sales list</DrawerDescription>
                                </DrawerHeader>
                                <div className="px-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="rounded-sm">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All</SelectItem>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button onClick={() => { fetchSales(); setDrawerOpen(false); }} className="rounded-sm">Apply</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="rounded-sm">Close</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                        {selected.length > 0 && (
                            <Button variant="destructive" onClick={() => {}} className="rounded-sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selected.length})
                            </Button>
                        )}
                    </div>

                    <Card className="rounded-sm shadow-none">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input type="checkbox" className="rounded-sm" onChange={(e) => {
                                            if (e.target.checked) setSelected(sales.map((s) => s.id));
                                            else setSelected([]);
                                        }} />
                                    </TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No flash sales found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                <input type="checkbox" className="rounded-sm" checked={selected.includes(sale.id)} onChange={(e) => {
                                                    if (e.target.checked) setSelected([...selected, sale.id]);
                                                    else setSelected(selected.filter((id) => id !== sale.id));
                                                }} />
                                            </TableCell>
                                            <TableCell className="font-medium">{sale.title}</TableCell>
                                            <TableCell>{sale.discount}%</TableCell>
                                            <TableCell>{sale.productIds.length} items</TableCell>
                                            <TableCell>{new Date(sale.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(sale.endDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{statusBadge(sale.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/promotions/flash-sales/${sale.id}`)} className="rounded-sm h-7 px-2">Edit</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sale.id)} className="rounded-sm h-7 px-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
