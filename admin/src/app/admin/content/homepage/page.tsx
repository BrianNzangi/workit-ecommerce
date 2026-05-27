'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/clients/http-client';
import { Button } from '@/components/ui/button';
import {
    HomepageControlHeader,
    HomepageControlList,
    HomepageControlLoadingState,
    AVAILABLE_SECTIONS,
} from '@/components/admin/content/homepage';
import type { HomepageSectionConfig, HomepageLayout, StoredSectionConfig } from '@/components/admin/content/homepage';

function buildDefaultLayout(): HomepageSectionConfig[] {
    return AVAILABLE_SECTIONS.map((section, index) => ({
        ...section,
        enabled: true,
        order: index + 1,
    }));
}

export default function HomepageControlPage() {
    const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [originalSections, setOriginalSections] = useState<HomepageSectionConfig[]>([]);

    const fetchLayout = useCallback(async () => {
        try {
            setLoading(true);
            const settings = await httpClient.settings.getAll();
            const layout: HomepageLayout | undefined = settings['homepage_layout'];

            const merged = AVAILABLE_SECTIONS.map((available, index) => {
                const existing = layout?.sections?.find((s) => s.key === available.key);
                return {
                    ...available,
                    enabled: existing?.enabled ?? true,
                    order: existing?.order ?? index + 1,
                };
            }).sort((a, b) => a.order - b.order);

            setSections(merged);
            setOriginalSections(JSON.parse(JSON.stringify(merged)));
            setIsDirty(false);
        } catch (error) {
            console.error('Error fetching homepage layout:', error);
            toast({
                title: 'Error',
                description: 'Failed to load homepage layout',
                variant: 'error',
            });
            const defaults = buildDefaultLayout();
            setSections(defaults);
            setOriginalSections(JSON.parse(JSON.stringify(defaults)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLayout();
    }, [fetchLayout]);

    const handleToggle = useCallback((key: string) => {
        setSections((prev) => {
            const next = prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s));
            setIsDirty(true);
            return next;
        });
    }, []);

    const handleMoveUp = useCallback((key: string) => {
        setSections((prev) => {
            const index = prev.findIndex((s) => s.key === key);
            if (index <= 0) return prev;
            const next = [...prev];
            const temp = next[index];
            next[index] = { ...next[index - 1], order: next[index - 1].order };
            next[index - 1] = { ...temp, order: temp.order };
            [next[index], next[index - 1]] = [next[index - 1], next[index]];
            const reordered = next.map((s, i) => ({ ...s, order: i + 1 }));
            setIsDirty(true);
            return reordered;
        });
    }, []);

    const handleMoveDown = useCallback((key: string) => {
        setSections((prev) => {
            const index = prev.findIndex((s) => s.key === key);
            if (index >= prev.length - 1) return prev;
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            const reordered = next.map((s, i) => ({ ...s, order: i + 1 }));
            setIsDirty(true);
            return reordered;
        });
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const layout: HomepageLayout = {
                sections: sections.map(({ key, enabled, order }) => ({ key, enabled, order })),
            };
            await httpClient.settings.updateAll({ homepage_layout: layout });
            setOriginalSections(JSON.parse(JSON.stringify(sections)));
            setIsDirty(false);
            toast({
                title: 'Saved',
                description: 'Homepage layout has been updated',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving homepage layout:', error);
            toast({
                title: 'Error',
                description: 'Failed to save homepage layout',
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    }, [sections]);

    const handleCancel = useCallback(() => {
        setSections(JSON.parse(JSON.stringify(originalSections)));
        setIsDirty(false);
    }, [originalSections]);

    return (
        <ProtectedRoute>
            <AdminLayout>
                <HomepageControlHeader />

                {loading ? (
                    <HomepageControlLoadingState />
                ) : (
                    <>
                        <HomepageControlList
                            sections={sections}
                            onToggle={handleToggle}
                            onMoveUp={handleMoveUp}
                            onMoveDown={handleMoveDown}
                        />

                        <div className="mt-6 flex items-center justify-end gap-3">
                            {isDirty && (
                                <>
                                    <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
