"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, AlertTriangle, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlogService } from "@/lib/services/content/blog.service";

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const service = new BlogService();
            const data = await service.getBlogs();
            setBlogs(data);
        } catch {
            toast({ title: "Error", description: "Failed to fetch blogs", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, title: string) => {
        setPostToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        setDeleteLoading(true);
        try {
            const service = new BlogService();
            await service.deleteBlog(postToDelete.id);
            setBlogs(blogs.filter((b) => b.id !== postToDelete.id));
            setDeleteDialogOpen(false);
            setPostToDelete(null);
            toast({ title: "Post deleted", description: `"${postToDelete.title}" deleted`, variant: "success" });
        } catch (error: any) {
            toast({ title: "Delete failed", description: error.message || "Failed to delete", variant: "error" });
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch =
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter =
            filterStatus === "all" ||
            (filterStatus === "published" && blog.published) ||
            (filterStatus === "draft" && !blog.published);
        return matchesSearch && matchesFilter;
    });

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h1 className="text-lg font-semibold">Blog Posts</h1>
                        <div className="flex items-center gap-2">
                            <div className="relative w-56">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search blog posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="rounded-sm pl-9 h-8 text-sm"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-28 rounded-sm h-8 bg-muted text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-sm">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button asChild size="sm" className="rounded-sm h-8">
                                <Link href="/admin/content/blog/new">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Create Blog Post
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <Card className="rounded-sm shadow-xs">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredBlogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-4">No blog posts found</p>
                                    <Button asChild size="sm" className="rounded-sm">
                                        <Link href="/admin/content/blog/new">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Create Blog Post
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Published Date</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead className="w-24 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBlogs.map((blog) => (
                                            <TableRow key={blog.id}>
                                                <TableCell>
                                                    <div>
                                                        <span className="text-sm font-medium">{blog.title}</span>
                                                        {blog.excerpt && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={blog.published ? "success" : "secondary"}
                                                        className="rounded-sm text-xs h-6 px-2"
                                                    >
                                                        {blog.published ? (
                                                            <><Eye className="w-3 h-3 mr-1" />Published</>
                                                        ) : (
                                                            <><EyeOff className="w-3 h-3 mr-1" />Draft</>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(blog.updatedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                            <Link href={`/admin/content/blog/${blog.id}/edit`}>
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDelete(blog.id, blog.title)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) { setDeleteDialogOpen(false); setPostToDelete(null); } }}>
                    <DialogContent className="rounded-sm max-w-md">
                        <DialogHeader className="gap-2">
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-center">Delete blog post</DialogTitle>
                            <DialogDescription className="text-center">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-foreground">"{postToDelete?.title}"</span>?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setPostToDelete(null); }} disabled={deleteLoading} className="rounded-sm">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading} className="rounded-sm">
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AdminLayout>
        </ProtectedRoute>
    );
}
