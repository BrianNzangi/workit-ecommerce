"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
};

export default function NewClearanceDealPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
    const [productSearch, setProductSearch] = useState("");
    const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [form, setForm] = useState({
        title: "",
        discount: "",
        type: "Promo",
        deal: "FLASH_SALE",
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
                setProductSuggestions(data.products || data || []);
                setShowSuggestions(true);
            }
        } catch {
            // silent
        }
    };

    const addProduct = (product: any) => {
        setSelectedProduct({
            id: product.id,
            name: product.name,
            image: product.images?.[0]?.url || product.thumbnail,
            category: product.category?.name || "Uncategorized",
            price: product.price,
        });
        setProductSearch("");
        setProductSuggestions([]);
        setShowSuggestions(false);
    };

    const removeProduct = () => {
        setSelectedProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            toast({ title: "Error", description: "Please select a product", variant: "error" });
            return;
        }
        setLoading(true);
        try {
            const csrfToken = (await ensureCsrfToken(authSessionUrl)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (csrfToken) headers[CSRF_HEADER_NAME] = csrfToken;

            const res = await fetch("/api/promotions/clearance-deals/admin", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    title: form.title,
                    discount: Number(form.discount),
                    type: form.type,
                    deal: form.deal,
                    productId: selectedProduct.id,
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                    status: form.status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Created", description: "Clearance deal created successfully", variant: "success" });
                router.push("/admin/promotions/clearance-deals");
            } else {
                toast({ title: "Error", description: data.message || "Failed to create clearance deal", variant: "error" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to create clearance deal", variant: "error" });
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
                            <h1 className="text-lg font-semibold">Create New Clearance Deal</h1>
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
                                        <Label>Discount</Label>
                                        <Input
                                            placeholder="Discount"
                                            type="number"
                                            value={form.discount}
                                            onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                            className="rounded-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                            <SelectTrigger className="rounded-sm bg-muted">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-sm">
                                                <SelectItem value="Promo">Promo</SelectItem>
                                                <SelectItem value="Clearance">Clearance</SelectItem>
                                                <SelectItem value="Sale">Sale</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deal Source</Label>
                                        <Select value={form.deal} onValueChange={(v) => setForm({ ...form, deal: v })}>
                                            <SelectTrigger className="rounded-sm bg-muted">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-sm">
                                                <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                                                <SelectItem value="FEATURED_DEAL">Featured Deal</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                            </CardContent>
                        </Card>

                        {/* Add Product for Clearance Deal */}
                        <Card className="rounded-sm shadow-none mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4">Add Product for Clearance Deal</h2>
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
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
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

                                {selectedProduct && (
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
                                                <TableRow key={selectedProduct.id}>
                                                    <TableCell>
                                                        <input type="checkbox" className="rounded-sm" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {selectedProduct.image ? (
                                                                <img src={selectedProduct.image} alt="" className="w-8 h-8 rounded-sm object-cover" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                                                                    <span className="text-xs text-muted-foreground">?</span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm">{selectedProduct.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{selectedProduct.category}</TableCell>
                                                    <TableCell className="text-sm">{selectedProduct.price ? `KES ${Number(selectedProduct.price).toLocaleString()}` : "—"}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Publish
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={removeProduct}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
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
