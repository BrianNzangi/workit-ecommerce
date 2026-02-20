import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CollectionsDeleteDialogProps {
    open: boolean;
    loading: boolean;
    collectionName?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CollectionsDeleteDialog({
    open,
    loading,
    collectionName,
    onOpenChange,
    onConfirm,
}: CollectionsDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete collection</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{collectionName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
