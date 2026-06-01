"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/card";
import { Search, Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type Review = {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    product: { id: string; name: string; slug: string };
    customer: { id: string; firstName: string | null; lastName: string | null; email: string };
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/admin/reviews?${params}`);
            const data = await res.json();
            if (data.success) setReviews(data.reviews);
            else if (data.reviews) setReviews(data.reviews);
        } catch {
            toast({ title: "Error", description: "Failed to fetch reviews", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            const res = await fetch(`/api/admin/reviews/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Success", description: `Review ${status.toLowerCase()}`, variant: "success" });
                fetchReviews();
            } else {
                toast({ title: "Error", description: data.message || "Failed to update review", variant: "error" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to update review", variant: "error" });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/admin/reviews/${deleteId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: "Review deleted", variant: "success" });
                fetchReviews();
            }
        } catch {
            toast({ title: "Error", description: "Failed to delete review", variant: "error" });
        } finally {
            setDeleteId(null);
        }
    };

    const statusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            PENDING: "secondary",
            APPROVED: "default",
            REJECTED: "destructive",
        };
        return <Badge variant={variants[status] || "outline"} className="rounded-sm">{status}</Badge>;
    };

    const filtered = reviews.filter((r) =>
        !search || r.product.name.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 sm:p-4">
                        <h1 className="text-2xl font-semibold">Reviews</h1>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input placeholder="Search by product, comment, or email..." value={search}
                                onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-sm" />
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setTimeout(fetchReviews, 0); }}>
                            <SelectTrigger className="w-40 rounded-sm">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">All</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Card className="rounded-sm shadow-none">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No reviews found</TableCell></TableRow>
                                ) : (
                                    filtered.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate">{review.product.name}</TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {review.customer.firstName || review.customer.lastName
                                                    ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim()
                                                    : review.customer.email}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <p className="truncate">{review.comment}</p>
                                                {review.title && <p className="text-xs text-muted-foreground truncate">{review.title}</p>}
                                            </TableCell>
                                            <TableCell>{statusBadge(review.status)}</TableCell>
                                            <TableCell className="text-sm">{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {review.status === "PENDING" && (
                                                        <>
                                                            <Button variant="ghost" size="sm" onClick={() => handleStatus(review.id, "APPROVED")}
                                                                className="rounded-sm h-7 w-7 p-0 text-green-600" title="Approve">
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleStatus(review.id, "REJECTED")}
                                                                className="rounded-sm h-7 w-7 p-0 text-red-600" title="Reject">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(review.id)}
                                                        className="rounded-sm h-7 w-7 p-0 text-destructive" title="Delete">
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

                <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Review</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this review? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-sm">Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete} className="rounded-sm">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AdminLayout>
        </ProtectedRoute>
    );
}
