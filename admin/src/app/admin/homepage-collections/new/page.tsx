"use client";

import { useState, useEffect } from "react";
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
import { Search, X, Trash2, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { HomepageCollectionService } from "@/lib/services";
import { getImageUrl } from "@/lib/shared/images/image-utils";

type SelectedProduct = {
    id: string;
    name: string;
    image?: string;
    sku?: string;
    salePrice?: number;
};

export default function NewHomepageCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        slug: "",
        sortOrder: 0,
        enabled: true,
    });
    const [products, setProducts] = useState<SelectedProduct[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchNextSortOrder = async () => {
            try {
                const service = new HomepageCollectionService();
                const collections = await service.getHomepageCollections();
                setForm((prev) => ({ ...prev, sortOrder: collections.length }));
            } catch {
                // keep default
            }
        };
        fetchNextSortOrder();
    }, []);

    const searchProducts = async (query: string) => {
        if (!query) {
            setProductSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setProductSuggestions(data.products || []);
                setShowSuggestions(true);
            }
        } catch {
            // silent
        }
    };

    const addProduct = (product: any) => {
        if (products.some((p) => p.id === product.id)) {
            toast({ title: "Product already added", variant: "error" });
            return;
        }
        setProducts((prev) => [
            ...prev,
            {
                id: product.id,
                name: product.name,
                image: product.assets?.[0]?.asset?.source,
                sku: product.sku,
                salePrice: product.salePrice,
            },
        ]);
        setProductSearch("");
        setProductSuggestions([]);
        setShowSuggestions(false);
    };

    const removeProduct = (productId: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const service = new HomepageCollectionService();
            await service.createHomepageCollection({
                title: form.title,
                slug: form.slug,
                enabled: form.enabled,
                sortOrder: form.sortOrder,
                productIds: products.map((p) => p.id),
            });
            toast({ title: "Collection created", description: "Homepage collection has been created.", variant: "success" });
            router.push("/admin/homepage-collections");
        } catch (err: any) {
            toast({ title: "Creation failed", description: err.message || "Something went wrong", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-semibold">Add New Homepage Collection</h1>
                        </div>
                        <Select value={String(form.enabled)} onValueChange={(v) => setForm({ ...form, enabled: v === "true" })}>
                            <SelectTrigger className="w-28 rounded-sm h-8 bg-muted">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-sm">
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
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
                                            placeholder="e.g. Featured Products"
                                            value={form.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setForm((prev) => ({
                                                    ...prev,
                                                    title: val,
                                                    slug: val
                                                        .toLowerCase()
                                                        .replace(/[^a-z0-9]+/g, "-")
                                                        .replace(/(^-|-$)/g, ""),
                                                }));
                                            }}
                                            className="rounded-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL Slug</Label>
                                        <Input
                                            placeholder="featured-products"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            className="rounded-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sort Order</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={form.sortOrder}
                                            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="rounded-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products */}
                        <Card className="rounded-sm shadow-none mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4">Collection Products</h2>

                                {/* Product Search */}
                                <div className="relative mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            placeholder="Search products to add..."
                                            value={productSearch}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                searchProducts(e.target.value);
                                            }}
                                            className="rounded-sm pl-9"
                                        />
                                        {productSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProductSearch("");
                                                    setProductSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="absolute right-3 top-2.5"
                                            >
                                                <X className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    {showSuggestions && productSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-sm shadow-lg max-h-48 overflow-auto">
                                            {productSuggestions.map((product: any) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => addProduct(product)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                                >
                                                    {product.assets?.[0]?.asset?.source ? (
                                                        <img
                                                            src={getImageUrl(product.assets[0].asset.source)}
                                                            alt=""
                                                            className="w-6 h-6 rounded-sm object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center">
                                                            <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <span>{product.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Products Table */}
                                {products.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-sm">
                                        <p className="text-sm text-muted-foreground">No products in this collection</p>
                                        <p className="text-xs text-muted-foreground mt-1">Search and add products to showcase them.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-sm overflow-hidden border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">#</th>
                                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
                                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground w-20">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((product, index) => (
                                                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                                                        <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {product.image ? (
                                                                    <img
                                                                        src={getImageUrl(product.image)}
                                                                        alt=""
                                                                        className="w-8 h-8 rounded-sm object-cover border"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                                                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <span className="font-medium">{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">{product.sku || "—"}</td>
                                                        <td className="px-4 py-3">
                                                            {product.salePrice ? `KES ${Number(product.salePrice).toLocaleString()}` : "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeProduct(product.id)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/homepage-collections")}
                                className="rounded-sm"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="rounded-sm">
                                {loading ? "Saving..." : "Create Collection"}
                            </Button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
