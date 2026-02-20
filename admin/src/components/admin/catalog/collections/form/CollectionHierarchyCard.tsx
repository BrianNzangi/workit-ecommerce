import { FolderTree, Layers, LayoutGrid, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CollectionLevel, CollectionTreeNode } from './types';

interface CollectionHierarchyCardProps {
    level: CollectionLevel;
    collections: CollectionTreeNode[];
    selectedL1: string;
    parentId: string;
    onLevelChange: (level: CollectionLevel) => void;
    onSelectedL1Change: (value: string) => void;
    onParentIdChange: (value: string) => void;
}

const levelOptions: Array<{
    id: CollectionLevel;
    label: string;
    description: string;
    icon: typeof Layers;
}> = [
        { id: '1', label: 'Level 1', description: 'Category', icon: Layers },
        { id: '2', label: 'Level 2', description: 'Group', icon: LayoutGrid },
        { id: '3', label: 'Level 3', description: 'Sub', icon: ListTree },
    ];

export function CollectionHierarchyCard({
    level,
    collections,
    selectedL1,
    parentId,
    onLevelChange,
    onSelectedL1Change,
    onParentIdChange,
}: CollectionHierarchyCardProps) {
    const parentL1 = collections.find((collection) => collection.id === selectedL1);

    return (
        <Card className="border-orange-200 bg-orange-50/60 shadow-xs">
            <CardHeader>
                <CardTitle className="text-base text-orange-900">Hierarchy Level *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {levelOptions.map((option) => {
                        const active = level === option.id;
                        return (
                            <Button
                                key={option.id}
                                type="button"
                                variant={active ? 'default' : 'outline'}
                                onClick={() => onLevelChange(option.id)}
                                className={`h-auto flex-col gap-1 py-3 ${active ? 'bg-primary-900 text-white hover:bg-primary-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <option.icon className="h-4 w-4" />
                                <span className="text-xs font-bold">{option.label}</span>
                                <span className="text-[10px] uppercase opacity-70">{option.description}</span>
                            </Button>
                        );
                    })}
                </div>

                <p className="text-[11px] italic text-orange-700/80">
                    {level === '1' && "Root category (e.g. 'Men'). No parent needed."}
                    {level === '2' && "Navigation header (e.g. 'Clothing'). Requires L1 parent."}
                    {level === '3' && "Direct link to products (e.g. 'T-Shirts'). Requires L2 parent."}
                </p>

                {level !== '1' ? (
                    <div className="space-y-4 border-t border-orange-200 pt-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-gray-700">
                                <FolderTree className="h-4 w-4 text-gray-400" />
                                {level === '2' ? 'Select Parent Category (L1) *' : 'Select Target Category (L1) *'}
                            </Label>
                            <Select
                                value={selectedL1 || undefined}
                                onValueChange={onSelectedL1Change}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collections.map((collection) => (
                                        <SelectItem key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {level === '3' && selectedL1 ? (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-gray-700">
                                    <FolderTree className="h-4 w-4 text-gray-400" />
                                    Select Parent Group (L2) *
                                </Label>
                                <Select
                                    value={parentId || undefined}
                                    onValueChange={onParentIdChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parentL1?.children?.map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] italic text-gray-500">
                                    Showing groups inside "{parentL1?.name || ''}"
                                </p>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
