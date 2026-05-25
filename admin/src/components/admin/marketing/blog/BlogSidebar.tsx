import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogSEOSection } from './BlogSEOSection';

interface BlogSidebarProps {
    featuredImage: string | null;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: () => void;
    author: string;
    onAuthorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImage: boolean;
    metaTitle: string;
    metaDescription: string;
    onMetaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    formData: {
        title: string;
        excerpt: string;
    };
}

export function BlogSidebar({
    featuredImage,
    onImageUpload,
    onImageRemove,
    author,
    onAuthorChange,
    uploadingImage,
    metaTitle,
    metaDescription,
    onMetaChange,
    formData,
}: BlogSidebarProps) {
    const generateSlug = (title: string): string => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    return (
        <div className="space-y-5">
            {/* Featured Image */}
            <Card className="rounded-sm shadow-xs">
                <CardContent className="p-5">
                    <Label className="text-sm font-medium mb-3 block">Featured Image</Label>
                    {featuredImage ? (
                        <div className="relative">
                            <div className="aspect-video w-full overflow-hidden rounded-sm">
                                <img src={featuredImage} alt="Featured" className="h-full w-full object-cover" />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onImageRemove}
                                className="absolute top-2 right-2 rounded-sm h-7 text-xs"
                            >
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-sm p-6 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={uploadingImage}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer block">
                                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground font-medium">
                                    {uploadingImage ? 'Uploading...' : 'Add image'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">or drop an image to upload</p>
                            </label>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Author */}
            <Card className="rounded-sm shadow-xs">
                <CardContent className="p-5">
                    <Label className="text-sm font-medium mb-2 block">Author</Label>
                    <Input
                        name="author"
                        value={author}
                        onChange={onAuthorChange}
                        placeholder="Author name"
                        className="rounded-sm"
                    />
                </CardContent>
            </Card>

            {/* SEO Section */}
            <BlogSEOSection
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                onChange={onMetaChange}
                previewTitle={formData.title}
                previewSlug={generateSlug(formData.title)}
                previewDescription={formData.excerpt}
            />
        </div>
    );
}
