import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface AssetsToolbarProps {
    allVisibleSelected: boolean;
    selectedCount: number;
    onToggleSelectAllVisible: () => void;
    onBulkDelete: () => void;
}

export function AssetsToolbar({
    allVisibleSelected,
    selectedCount,
    onToggleSelectAllVisible,
    onBulkDelete,
}: AssetsToolbarProps) {
    return (
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <Checkbox checked={allVisibleSelected} onCheckedChange={onToggleSelectAllVisible} />
                Select all on this page
            </label>

            <Button
                variant="destructive"
                onClick={onBulkDelete}
                disabled={selectedCount === 0}
                className="bg-red-500 text-white hover:bg-red-600"
            >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedCount})
            </Button>
        </div>
    );
}
