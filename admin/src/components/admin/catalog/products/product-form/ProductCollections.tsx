'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/shared/utils/cn';
import { Collection } from './useProductForm';

interface ProductCollectionsProps {
    collections: Collection[];
    selectedCollections: string[];
    expandedCollections: Set<string>;
    toggleCollection: (id: string) => void;
    toggleExpanded: (id: string) => void;
}

export function ProductCollections({
    collections,
    selectedCollections,
    expandedCollections,
    toggleCollection,
    toggleExpanded,
}: ProductCollectionsProps) {
    const renderCollectionItem = (collection: Collection, level = 0) => {
        const isExpanded = expandedCollections.has(collection.id);
        const hasChildren = collection.children && collection.children.length > 0;
        const isSelected = selectedCollections.includes(collection.id);

        const hasAnySelectedDescendant = (col: Collection): boolean => {
            if (!col.children) return false;
            return col.children.some(child =>
                selectedCollections.includes(child.id) || hasAnySelectedDescendant(child)
            );
        };

        const isImplicitlySelected = !isSelected && hasAnySelectedDescendant(collection);

        return (
            <div key={collection.id}>
                <div className={cn("flex items-center group/item", level > 0 && "ml-4")}>
                    <div className="flex-1 flex items-center gap-2 py-1 px-1 hover:bg-accent/50 rounded transition-colors cursor-pointer">
                        {level === 2 ? (
                            <Checkbox
                                id={`collection-${collection.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleCollection(collection.id)}
                            />
                        ) : (
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                {isImplicitlySelected && (
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" title="Contains selected sub-collections" />
                                )}
                            </div>
                        )}

                        <div
                            className="flex-1 flex items-center justify-between gap-2"
                            onClick={() => {
                                if (level === 2) {
                                    toggleCollection(collection.id);
                                } else if (hasChildren) {
                                    toggleExpanded(collection.id);
                                }
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor={level === 2 ? `collection-${collection.id}` : undefined}
                                    className={cn(
                                        "text-sm cursor-pointer",
                                        level === 0 ? "font-bold" : level === 1 ? "font-medium" : "text-muted-foreground"
                                    )}
                                >
                                    {collection.name}
                                </Label>

                                <div className="flex gap-1">
                                    {level === 0 && <Badge variant="outline" className="px-1 py-0 h-4 text-[8px] uppercase">L1</Badge>}
                                    {level === 1 && <Badge variant="secondary" className="px-1 py-0 h-4 text-[8px] uppercase">L2</Badge>}
                                    {level === 2 && <Badge variant="default" className="px-1 py-0 h-4 text-[8px] uppercase bg-blue-500 text-white">L3</Badge>}
                                </div>
                            </div>

                            {hasChildren && (
                                <span className="text-[10px] text-muted-foreground font-medium italic">
                                    ({collection.children!.length})
                                </span>
                            )}
                        </div>
                    </div>

                    {hasChildren && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(collection.id);
                            }}
                            className="h-7 w-7 rounded-sm transition-colors ml-1"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-gray-200 ml-3 pl-2.5 mb-1">
                        {collection.children!.map((child) => renderCollectionItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border border-gray-200 rounded-md overflow-hidden bg-accent/5">
                    {collections.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 italic">No collections available</p>
                    ) : (
                        <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
                            {collections
                                .filter((c) => !c.parentId)
                                .map((collection) => renderCollectionItem(collection))}
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Select one or more collections this product belongs to.
                </p>
            </CardContent>
        </Card>
    );
}
