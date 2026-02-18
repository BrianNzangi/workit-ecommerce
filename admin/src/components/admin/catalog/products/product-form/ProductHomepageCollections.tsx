'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/Badge';
import { HomepageCollection } from './useProductForm';

interface ProductHomepageCollectionsProps {
    homepageCollections: HomepageCollection[];
    selectedHomepageCollections: string[];
    toggleHomepageCollection: (id: string) => void;
}

export function ProductHomepageCollections({
    homepageCollections,
    selectedHomepageCollections,
    toggleHomepageCollection,
}: ProductHomepageCollectionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Homepage Collections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border border-gray-200 rounded-md overflow-hidden bg-accent/5">
                    {homepageCollections.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 italic">No homepage collections available</p>
                    ) : (
                        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
                            {homepageCollections.map((collection) => (
                                <div
                                    key={collection.id}
                                    className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 last:border-0 hover:bg-accent/50 transition-colors"
                                >
                                    <Checkbox
                                        id={`hp-collection-${collection.id}`}
                                        checked={selectedHomepageCollections.includes(collection.id)}
                                        onCheckedChange={() => toggleHomepageCollection(collection.id)}
                                    />
                                    <div className="flex-1 flex items-center justify-between gap-4">
                                        <Label
                                            htmlFor={`hp-collection-${collection.id}`}
                                            className="flex flex-col gap-0.5 cursor-pointer"
                                        >
                                            <span className="text-sm font-medium">
                                                {collection.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {collection.slug}
                                            </span>
                                        </Label>

                                        {collection.enabled ? (
                                            <Badge variant="success" className="h-4 px-1.5 text-[9px]">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                                                Draft
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Featured sections on the home page where this product will appear.
                </p>
            </CardContent>
        </Card>
    );
}
