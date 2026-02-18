'use client';

import React, { useState } from 'react';
import { Upload, FileDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => Promise<void>;
}

export function ImportProductsModal({ isOpen, onClose, onImportSuccess }: ImportProductsModalProps) {
    const [importing, setImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResults, setImportResults] = useState<any>(null);

    const handleImport = async () => {
        if (!importFile) return;

        setImporting(true);
        setImportResults(null);

        try {
            const formData = new FormData();
            formData.append('file', importFile);

            const response = await fetch('/api/admin/products/import', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const results = await response.json();
                setImportResults(results);
                await onImportSuccess();
                toast({
                    title: 'Import Complete',
                    description: `Successfully imported ${results.success} products.`,
                    variant: 'success',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Import Failed',
                    description: error.error || 'Failed to import products',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error importing products:', error);
            toast({
                title: 'Import Error',
                description: 'An unexpected error occurred during import',
                variant: 'error',
            });
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setImportFile(null);
        setImportResults(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg border-gray-200">
                <DialogHeader>
                    <DialogTitle>Import Products</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with product data. Download the template for the correct format.
                    </DialogDescription>
                </DialogHeader>

                {!importResults ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="csv-upload">Select CSV File</Label>
                            <Input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="cursor-pointer border-gray-200"
                            />
                            <p className="text-xs text-muted-foreground">
                                Supported format: CSV. Ensure columns match the template.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted/50 rounded-md border border-gray-200 text-sm space-y-1">
                            <p><span className="font-semibold">Total:</span> {importResults.total}</p>
                            <p className="text-green-600"><span className="font-semibold">Success:</span> {importResults.success}</p>
                            <p className="text-destructive"><span className="font-semibold">Failed:</span> {importResults.failed}</p>
                        </div>

                        {importResults.errors && importResults.errors.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                                <p className="text-sm font-medium">Errors:</p>
                                {importResults.errors.map((err: any, idx: number) => (
                                    <p key={idx} className="text-xs text-destructive">
                                        Row {err.row}: {err.error}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!importResults ? (
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!importFile || importing}
                                className="flex-1 bg-primary text-white"
                            >
                                {importing ? 'Importing...' : 'Import'}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleClose}
                            className="w-full bg-primary text-white"
                        >
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
