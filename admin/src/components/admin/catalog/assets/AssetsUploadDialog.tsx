import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize } from './assets-utils';

interface AssetsUploadDialogProps {
    open: boolean;
    selectedFiles: File[];
    uploading: boolean;
    onOpenChange: (open: boolean) => void;
    onFilesChange: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    onUpload: () => void;
}

export function AssetsUploadDialog({
    open,
    selectedFiles,
    uploading,
    onOpenChange,
    onFilesChange,
    onRemoveFile,
    onUpload,
}: AssetsUploadDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Assets</DialogTitle>
                    <DialogDescription>Add images and files to your media library</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-center transition-colors hover:border-primary-900">
                        <div className="flex flex-col items-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                                <Upload className="h-8 w-8 text-primary-900" />
                            </div>
                            <label className="cursor-pointer">
                                <span className="text-base font-medium text-gray-900">Click to select files</span>
                                <span className="text-base text-gray-500"> or drag and drop</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => onFilesChange(e.target.files)}
                                    className="hidden"
                                />
                            </label>
                            <p className="mt-2 text-sm text-gray-500">PNG, JPG, WebP, GIF up to 10MB each</p>
                        </div>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">Selected Files</p>
                                <span className="text-sm text-gray-500">
                                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3">
                                {selectedFiles.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                                                <ImageIcon className="h-5 w-5 text-primary-900" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveFile(index)}
                                            className="ml-2 h-8 w-8 text-gray-400 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="bg-primary-900 text-white hover:bg-primary-800"
                    >
                        {uploading
                            ? 'Uploading...'
                            : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
