import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DeleteMode } from './types';

interface AssetsDeleteDialogProps {
    open: boolean;
    mode: DeleteMode;
    selectedCount: number;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function AssetsDeleteDialog({
    open,
    mode,
    selectedCount,
    onOpenChange,
    onConfirm,
}: AssetsDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'single' ? 'Delete Asset' : 'Delete Selected Assets'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'single'
                            ? 'Are you sure you want to delete this asset? This action cannot be undone.'
                            : `Are you sure you want to delete ${selectedCount} selected assets? This action cannot be undone.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
