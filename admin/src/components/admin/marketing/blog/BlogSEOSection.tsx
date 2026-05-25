import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface BlogSEOSectionProps {
    metaTitle: string;
    metaDescription: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    previewTitle: string;
    previewSlug: string;
    previewDescription: string;
}

export function BlogSEOSection({
    metaTitle,
    metaDescription,
    onChange,
    previewTitle,
    previewSlug,
    previewDescription,
}: BlogSEOSectionProps) {
    return (
        <Card className="rounded-sm shadow-xs">
            <CardContent className="p-5">
                <Label className="text-sm font-medium mb-1 block">Search engine listing</Label>
                <p className="text-xs text-muted-foreground mb-4">
                    Add a title and description to see how this blog post might appear in a search engine listing
                </p>
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs mb-1.5 block">Meta Title</Label>
                        <Input
                            name="metaTitle"
                            value={metaTitle}
                            onChange={onChange}
                            placeholder={previewTitle || 'Blog post title'}
                            className="rounded-sm"
                            maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{metaTitle.length}/60 characters</p>
                    </div>
                    <div>
                        <Label className="text-xs mb-1.5 block">Meta Description</Label>
                        <Textarea
                            name="metaDescription"
                            value={metaDescription}
                            onChange={onChange}
                            placeholder={previewDescription || 'Brief description of your blog post'}
                            rows={3}
                            className="rounded-sm"
                            maxLength={160}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160 characters</p>
                    </div>
                    {(metaTitle || previewTitle) && (
                        <div className="mt-4 p-4 bg-muted rounded-sm">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                                {metaTitle || previewTitle}
                            </h4>
                            <p className="text-green-700 text-sm mt-1">workit.co.ke › blog › {previewSlug}</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                {metaDescription || previewDescription || 'No description available'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
