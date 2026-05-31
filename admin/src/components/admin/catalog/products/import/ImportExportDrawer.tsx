'use client';

import React, { useState } from 'react';
import { Upload, Download, FileDown, FileJson, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import { toast } from '@/hooks/use-toast';
import {
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    ensureCsrfToken,
    getCookieValue,
    getSessionUrl,
} from '@/lib/auth/csrf';

const AUTH_SESSION_URL = getSessionUrl(
    process.env.NEXT_PUBLIC_AUTH_PATH || '/api/auth',
    process.env.NEXT_PUBLIC_AUTH_BASE_URL || '',
);

interface ImportExportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => Promise<void>;
}

const TEMPLATE_JSON = JSON.stringify([
    {
        name: 'Example Product',
        slug: 'example-product',
        description: 'Product description here',
        salePrice: 1500,
        originalPrice: 2000,
        stockOnHand: 20,
        enabled: true,
        condition: 'NEW',
        brandSlug: 'brand-slug',
        collections: 'collection-slug-1|collection-slug-2',
    },
], null, 2);

export function ImportExportDrawer({ isOpen, onClose, onImportSuccess }: ImportExportDrawerProps) {
    const [importing, setImporting] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);
    const [importResults, setImportResults] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const validateJson = (): any[] | null => {
        setParseError(null);
        const trimmed = jsonInput.trim();
        if (!trimmed) {
            setParseError('Please paste product JSON data');
            return null;
        }
        try {
            const parsed = JSON.parse(trimmed);
            if (!Array.isArray(parsed)) {
                setParseError('JSON must be an array of products');
                return null;
            }
            if (parsed.length === 0) {
                setParseError('Array is empty — at least one product required');
                return null;
            }
            for (let i = 0; i < parsed.length; i++) {
                if (!parsed[i].name || !parsed[i].slug) {
                    setParseError(`Item ${i + 1}: missing required field "name" or "slug"`);
                    return null;
                }
            }
            return parsed;
        } catch (e: any) {
            setParseError(e.message || 'Invalid JSON');
            return null;
        }
    };

    const handleImport = async () => {
        const products = validateJson();
        if (!products) return;

        setImporting(true);
        setImportResults(null);

        try {
            const csrfToken = (await ensureCsrfToken(AUTH_SESSION_URL)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (csrfToken) {
                headers[CSRF_HEADER_NAME] = csrfToken;
            }

            const response = await fetch('/api/admin/products/import', {
                method: 'POST',
                headers,
                body: JSON.stringify({ products }),
            });

            if (response.ok) {
                const results = await response.json();
                setImportResults(results);
                await onImportSuccess();
                toast({
                    title: 'Import Complete',
                    description: `Created ${results.created}, updated ${results.updated}, skipped ${results.skipped}`,
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

    const handleExport = async () => {
        try {
            const response = await fetch('/api/admin/products/export');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `products-export-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error exporting products:', error);
            toast({
                title: 'Export failed',
                description: 'Failed to export products',
                variant: 'error',
            });
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch('/api/admin/products/template');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'product-import-template.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            toast({
                title: 'Download failed',
                description: 'Failed to download template',
                variant: 'error',
            });
        }
    };

    const insertTemplate = () => {
        setJsonInput(TEMPLATE_JSON);
        setParseError(null);
        setImportResults(null);
    };

    const handleClose = () => {
        setJsonInput('');
        setParseError(null);
        setImportResults(null);
        onClose();
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()} direction="right">
            <DrawerContent side="right" className="w-140 max-w-[95vw]">
                <DrawerHeader className="text-left">
                    <DrawerTitle>Import & Export Products</DrawerTitle>
                    <DrawerDescription>
                        Paste JSON to import, or export your product catalog
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleDownloadTemplate} className="flex-1 gap-2">
                                    <FileDown className="h-4 w-4" />
                                    Template
                                </Button>
                                <Button variant="outline" onClick={handleExport} className="flex-1 gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium mb-2">Import JSON</h3>
                            {!importResults ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="json-input">Paste product JSON</Label>
                                        <button
                                            type="button"
                                            onClick={insertTemplate}
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                        >
                                            <FileJson className="h-3 w-3" />
                                            Insert sample
                                        </button>
                                    </div>
                                    <Textarea
                                        id="json-input"
                                        value={jsonInput}
                                        onChange={(e) => {
                                            setJsonInput(e.target.value);
                                            if (parseError) setParseError(null);
                                        }}
                                        placeholder='[{ "name": "Product", "slug": "product", ... }]'
                                        className="font-mono text-xs min-h-50 resize-y"
                                        rows={10}
                                    />
                                    {parseError && (
                                        <p className="text-xs text-destructive">{parseError}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Array of products. Required: name, slug. Optional: description, salePrice, originalPrice, stockOnHand, enabled, condition, brandSlug, collections (pipe-separated slugs). SKU is auto-assigned on import. VAT defaults to 0, VAT inclusive defaults to true.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="rounded-md border bg-muted/50 p-4 text-sm space-y-1">
                                        <p><span className="font-medium">Total:</span> {importResults.total}</p>
                                        <p className="text-blue-600"><span className="font-medium">Created:</span> {importResults.created}</p>
                                        <p className="text-green-600"><span className="font-medium">Updated:</span> {importResults.updated}</p>
                                        <p className="text-destructive"><span className="font-medium">Skipped:</span> {importResults.skipped}</p>
                                    </div>

                                    {importResults.errors && importResults.errors.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">Errors:</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(
                                                            importResults.errors.join('\n')
                                                        );
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                >
                                                    {copied ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                    {copied ? 'Copied' : 'Copy all'}
                                                </button>
                                            </div>
                                            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-3 text-xs text-destructive select-all">
                                                {importResults.errors.join('\n')}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DrawerFooter className="flex-col gap-2">
                    {!importResults ? (
                        <Button
                            onClick={handleImport}
                            disabled={!jsonInput.trim() || importing}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            {importing ? 'Importing...' : 'Import'}
                        </Button>
                    ) : (
                        <Button onClick={handleClose}>
                            Close
                        </Button>
                    )}
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
