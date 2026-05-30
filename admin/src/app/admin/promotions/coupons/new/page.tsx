"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Search, CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/shared/utils/cn";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, ensureCsrfToken, getCookieValue, getSessionUrl } from '@/lib/auth/csrf';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type SelectedProduct = {
    id: string;
    name: string;
    image?: string;
    category?: string;
    price?: number;
    status?: string;
};

export default function NewCouponPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [form, setForm] = useState({
        title: "",
        couponAmount: "",
        minAmount: "",
        userLimit: "",
        description: "",
        status: "ACTIVE",
    });

    const authBaseURL = typeof window !== 'undefined' ? window.location.origin : '';
    const authSessionUrl = getSessionUrl(
        process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim() || '/api/auth',
        process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || authBaseURL,
    );

    const searchProducts = async (query: string) => {
        if (!query) {
            setProductSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setProductSuggestions(data.products || []);
                setShowSuggestions(true);
            }
        } catch {
            // silent
        }
    };

    const addProduct = (product: any) => {
        if (selectedProducts.some((p) => p.id === product.id)) return;
        setSelectedProducts([...selectedProducts, {
            id: product.id,
            name: product.name,
            image: product.images?.[0]?.url || product.thumbnail,
            category: product.category?.name || "Uncategorized",
            price: product.price,
            status: product.status || "Draft",
        }]);
        setProductSearch("");
        setProductSuggestions([]);
        setShowSuggestions(false);
    };

    const removeProduct = (id: string) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const csrfToken = (await ensureCsrfToken(authSessionUrl)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (csrfToken) headers[CSRF_HEADER_NAME] = csrfToken;

            const res = await fetch("/api/promotions/coupons/admin", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    title: form.title,
                    couponAmount: Number(form.couponAmount),
                    minAmount: Number(form.minAmount) || 0,
                    userLimit: Number(form.userLimit) || 0,
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                    description: form.description,
                    status: form.status,
                    productIds: selectedProducts.map((p) => p.id),
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Created", description: "Coupon created successfully", variant: "success" });
                router.push("/admin/promotions/coupons");
            } else {
                toast({ title: "Error", description: data.message || "Failed to create coupon", variant: "error" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to create coupon", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h1 className="text-lg font-semibold">Create New Coupon</h1>
                        </div>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                            <SelectTrigger className="w-28 rounded-sm h-8 bg-muted">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-sm">
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <Card className="rounded-sm shadow-none mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4">Basic Information</h2>

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            placeholder="Title"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="rounded-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>User Limit</Label>
                                        <Input
                                            placeholder="User Limit"
                                            type="number"
                                            value={form.userLimit}
                                            onChange={(e) => setForm({ ...form, userLimit: e.target.value })}
                                            className="rounded-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Coupon Amount</Label>
                                        <Input
                                            placeholder="Coupon Amount"
                                            type="number"
                                            value={form.couponAmount}
                                            onChange={(e) => setForm({ ...form, couponAmount: e.target.value })}
                                            className="rounded-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Min Amount</Label>
                                        <Input
                                            placeholder="Min Amount"
                                            type="number"
                                            value={form.minAmount}
                                            onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                                            className="rounded-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-muted rounded-sm",
                                                        !startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-muted rounded-sm",
                                                        !endDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Short Description */}
                                <div className="mt-4 space-y-2">
                                    <Label>Short Description</Label>
                                    <Textarea
                                        placeholder="Short Description"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="resize-none h-20"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add Product for Coupon */}
                        <Card className="rounded-sm shadow-none mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4">Add Product for Coupon</h2>
                                <div className="relative mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            placeholder="Search Product"
                                            value={productSearch}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                searchProducts(e.target.value);
                                            }}
                                            className="rounded-sm pl-9"
                                        />
                                    </div>
                                    {showSuggestions && productSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-popover rounded-sm shadow-lg max-h-48 overflow-auto">
                                            {productSuggestions.map((product: any) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => addProduct(product)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                                >
                                                    {product.thumbnail && (
                                                        <img src={product.thumbnail} alt="" className="w-6 h-6 rounded-sm object-cover" />
                                                    )}
                                                    <span>{product.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Products Table */}
                                {selectedProducts.length > 0 && (
                                    <div className="rounded-sm overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">
                                                        <input type="checkbox" className="rounded-sm" />
                                                    </TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-20">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedProducts.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>
                                                            <input type="checkbox" className="rounded-sm" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {product.image ? (
                                                                    <img src={product.image} alt="" className="w-8 h-8 rounded-sm object-cover" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                                                                        <span className="text-xs text-muted-foreground">?</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-sm">{product.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{product.category}</TableCell>
                                                        <TableCell className="text-sm">{product.price ? `KES ${Number(product.price).toLocaleString()}` : "—"}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Publish
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeProduct(product.id)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="rounded-sm"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="rounded-sm">
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
