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

type ClearanceDeal = {
    id: string;
    title: string;
    discount: number;
    type: string;
    deal: string | null;
    startDate: string;
    endDate: string;
    status: "DRAFT" | "ACTIVE" | "EXPIRED" | "DISABLED";
    productName: string | null;
    createdAt: string;
};

export default function ClearanceDealsPage() {
    const router = useRouter();
    const [deals, setDeals] = useState<ClearanceDeal[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchDeals = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/promotions/clearance-deals/admin?${params}`);
            const data = await res.json();
            if (data.success) setDeals(data.clearanceDeals);
        } catch {
            toast({ title: "Error", description: "Failed to fetch clearance deals", variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/promotions/clearance-deals/admin/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: "Clearance deal removed", variant: "success" });
                fetchDeals();
            }
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "error" });
        }
    };

    const statusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            DRAFT: "secondary",
            ACTIVE: "default",
            EXPIRED: "destructive",
            DISABLED: "outline",
        };
        return <Badge variant={variants[status] || "outline"} className="rounded-sm">{status}</Badge>;
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 sm:p-4">
                        <h1 className="text-2xl font-semibold">Clearance Deals</h1>
                        <Button onClick={() => router.push("/admin/promotions/clearance-deals/new")} className="rounded-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Clearance Deal
                        </Button>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search clearance deals..."
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
                                    <DrawerTitle>Filter Clearance Deals</DrawerTitle>
                                    <DrawerDescription>Narrow down your clearance deals list</DrawerDescription>
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
                                                <SelectItem value="EXPIRED">Expired</SelectItem>
                                                <SelectItem value="DISABLED">Disabled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button onClick={() => { fetchDeals(); setDrawerOpen(false); }} className="rounded-sm">Apply</Button>
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
                                            if (e.target.checked) setSelected(deals.map((d) => d.id));
                                            else setSelected([]);
                                        }} />
                                    </TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Deal</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            No clearance deals found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    deals.map((deal) => (
                                        <TableRow key={deal.id}>
                                            <TableCell>
                                                <input type="checkbox" className="rounded-sm" checked={selected.includes(deal.id)} onChange={(e) => {
                                                    if (e.target.checked) setSelected([...selected, deal.id]);
                                                    else setSelected(selected.filter((id) => id !== deal.id));
                                                }} />
                                            </TableCell>
                                            <TableCell className="font-medium">{deal.title}</TableCell>
                                            <TableCell>{deal.productName || "—"}</TableCell>
                                            <TableCell>{deal.discount}%</TableCell>
                                            <TableCell>{deal.type}</TableCell>
                                            <TableCell>{deal.deal || "—"}</TableCell>
                                            <TableCell>{new Date(deal.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(deal.endDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{statusBadge(deal.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/promotions/clearance-deals/${deal.id}`)} className="rounded-sm h-7 px-2">Edit</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(deal.id)} className="rounded-sm h-7 px-2 text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
