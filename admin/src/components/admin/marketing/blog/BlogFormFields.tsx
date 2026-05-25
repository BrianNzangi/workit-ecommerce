import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface BlogFormFieldsProps {
    formData: {
        title: string;
        excerpt: string;
        author: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    errors: Record<string, string>;
}

export function BlogFormFields({ formData, onChange, errors }: BlogFormFieldsProps) {
    return (
        <>
            <Card className="rounded-sm shadow-xs">
                <CardContent className="p-5">
                    <Label className="text-sm font-medium mb-2 block">Title</Label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                        placeholder="e.g., Blog about your latest products or deals"
                        className={`rounded-sm ${errors.title ? "border-destructive" : ""}`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                </CardContent>
            </Card>

            <Card className="rounded-sm shadow-xs">
                <CardContent className="p-5">
                    <Label className="text-sm font-medium mb-2 block">Excerpt</Label>
                    <p className="text-xs text-muted-foreground mb-2">Add a summary of the post to appear on your home page or blog.</p>
                    <Textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={onChange}
                        rows={3}
                        className="rounded-sm"
                    />
                </CardContent>
            </Card>
        </>
    );
}
