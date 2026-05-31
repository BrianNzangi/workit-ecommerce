"use client";

import { useState, useEffect } from "react";
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

type Coupon = {
    id: string;
    title: string;
    code: string | null;
    couponAmount: number;
    minAmount: number;
    userLimit: number;
    startDate: string;
    endDate: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "DRAFT";
    productsCount: number;
    createdAt: string;
};

export default function CouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/promotions/coupons/admin?${params}`);
            const data = await res.json();
            if (data.success) setCoupons(data.coupons);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch coupons", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/promotions/coupons/admin/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: "Coupon removed", variant: "success" });
                fetchCoupons();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "error" });
        }
    };

    const handleBulkDelete = async () => {
        if (selected.length === 0) return;
        try {
            const res = await fetch("/api/promotions/coupons/admin/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selected }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: `${selected.length} coupons removed`, variant: "success" });
                setSelected([]);
                fetchCoupons();
            }
        } catch (error) {
            toast({ title: "Error", description: "Bulk delete failed", variant: "error" });
        }
    };

    const statusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            DRAFT: "secondary",
            ACTIVE: "default",
            EXPIRED: "destructive",
            INACTIVE: "outline",
        };
        return <Badge variant={variants[status] || "outline"} className="rounded-sm">{status}</Badge>;
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 sm:p-4">
                        <h1 className="text-2xl font-semibold">Coupons</h1>
                        <Button onClick={() => router.push("/admin/promotions/coupons/new")} className="rounded-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Coupon
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search coupons..."
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
                                    <DrawerTitle>Filter Coupons</DrawerTitle>
                                    <DrawerDescription>Narrow down your coupon list</DrawerDescription>
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
                                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                <SelectItem value="EXPIRED">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button onClick={() => { fetchCoupons(); setDrawerOpen(false); }} className="rounded-sm">Apply</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="rounded-sm">Close</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                        {selected.length > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete} className="rounded-sm">
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
                                        <input
                                            type="checkbox"
                                            className="rounded-sm"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelected(coupons.map((c) => c.id));
                                                else setSelected([]);
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Min Amount</TableHead>
                                    <TableHead>User Limit</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            No coupons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    coupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="rounded-sm"
                                                    checked={selected.includes(coupon.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelected([...selected, coupon.id]);
                                                        else setSelected(selected.filter((id) => id !== coupon.id));
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{coupon.title}</TableCell>
                                            <TableCell>${coupon.couponAmount}</TableCell>
                                            <TableCell>${coupon.minAmount}</TableCell>
                                            <TableCell>{coupon.userLimit || "∞"}</TableCell>
                                            <TableCell>{coupon.productsCount || 0}</TableCell>
                                            <TableCell>{statusBadge(coupon.status)}</TableCell>
                                            <TableCell>{new Date(coupon.endDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/promotions/coupons/${coupon.id}`)}
                                                        className="rounded-sm h-7 px-2"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="rounded-sm h-7 px-2 text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
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
