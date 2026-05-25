import { FolderTree, Layers, LayoutGrid, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        { id: '1', label: 'Category', description: 'Top level', icon: Layers },
        { id: '2', label: 'Group', description: 'Sub-category', icon: LayoutGrid },
        { id: '3', label: 'Sub-group', description: 'Deep level', icon: ListTree },
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
        <div className="bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Hierarchy Level</h3>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {levelOptions.map((option) => {
                    const active = level === option.id;
                    const Icon = option.icon;
                    return (
                        <Button
                            key={option.id}
                            type="button"
                            variant={active ? 'default' : 'outline'}
                            onClick={() => onLevelChange(option.id)}
                            className={`h-auto flex-col gap-1 py-2.5 ${active ? 'bg-primary-900 hover:bg-primary-800' : ''}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{option.label}</span>
                        </Button>
                    );
                })}
            </div>

            {level !== '1' && (
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500">
                            {level === '2' ? 'Parent Category' : 'Target Category'}
                        </Label>
                        <Select
                            value={selectedL1 || undefined}
                            onValueChange={onSelectedL1Change}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="[&_[data-highlighted]]:bg-primary-900 [&_[data-highlighted]]:text-primary-50">
                                {collections.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {level === '3' && selectedL1 && (
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Parent Group</Label>
                            <Select
                                value={parentId || undefined}
                                onValueChange={onParentIdChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent className="[&_[data-highlighted]]:bg-primary-900 [&_[data-highlighted]]:text-primary-50">
                                    {parentL1?.children?.map((group) => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-400">Inside "{parentL1?.name}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
