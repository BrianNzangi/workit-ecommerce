'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminSettingsService } from '@/lib/services';

interface ShippingCity {
    id?: string;
    cityTown: string;
    standardPrice: number;
    expressPrice?: number;
}

interface ShippingZone {
    id?: string;
    shippingMethodId: string;
    county: string;
    cities: ShippingCity[];
}

interface ShippingMethod {
    id: string;
    code: string;
    name: string;
    description: string;
    enabled: boolean;
    isExpress: boolean;
    zones?: ShippingZone[];
}

interface GroupedZone {
    zone: ShippingZone;
    cities: ShippingCity[];
    methodName: string;
}

interface ShippingTabProps {
    readOnly?: boolean;
}

export default function ShippingTab({ readOnly = false }: ShippingTabProps) {
    const settingsServiceRef = useRef<AdminSettingsService>(new AdminSettingsService());
    const settingsService = settingsServiceRef.current;
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

    const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
    const [countyPages, setCountyPages] = useState<{ [key: string]: number }>({});
    const citiesPerPage = 20;

    const [formData, setFormData] = useState({
        shippingMethodId: '',
        county: '',
        cities: [{ cityTown: '', standardPrice: 0, expressPrice: undefined }] as ShippingCity[],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await settingsService.getShippingMethods();
            setMethods(data);

            const allZones: ShippingZone[] = [];
            data.forEach((method: ShippingMethod) => {
                (method.zones || []).forEach((zone: ShippingZone) => {
                    allZones.push({
                        ...zone,
                        shippingMethodId: method.id,
                        cities: zone.cities || [],
                    });
                });
            });
            setZones(allZones);
        } catch (error) {
            console.error('Error fetching shipping data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load shipping data',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const getGroupedZones = (): GroupedZone[] => {
        const grouped: { [key: string]: GroupedZone } = {};

        zones.forEach((zone) => {
            const key = `${zone.county}-${zone.shippingMethodId}`;
            if (!grouped[key]) {
                const method = methods.find((m) => m.id === zone.shippingMethodId);
                grouped[key] = {
                    zone: { ...zone, cities: [] },
                    cities: [],
                    methodName: method?.name || zone.shippingMethodId,
                };
            }
            grouped[key].cities.push(...zone.cities);
        });

        return Object.values(grouped);
    };

    const getUniqueCounties = (): string[] => {
        const counties = zones.map((z) => z.county);
        return Array.from(new Set(counties)).sort();
    };

    const toggleCounty = (countyKey: string) => {
        setExpandedCounties((prev) => {
            const next = new Set(prev);
            if (next.has(countyKey)) {
                next.delete(countyKey);
            } else {
                next.add(countyKey);
            }
            return next;
        });
    };

    const getCurrentPage = (countyKey: string) => countyPages[countyKey] || 1;

    const setCountyPage = (countyKey: string, page: number) => {
        setCountyPages((prev) => ({ ...prev, [countyKey]: page }));
    };

    const getPaginatedCities = (cities: ShippingCity[], countyKey: string) => {
        const currentPage = getCurrentPage(countyKey);
        const startIndex = (currentPage - 1) * citiesPerPage;
        const endIndex = startIndex + citiesPerPage;
        return cities.slice(startIndex, endIndex);
    };

    const getTotalPages = (citiesCount: number) => Math.ceil(citiesCount / citiesPerPage);

    const getPageWindow = (currentPage: number, totalPages: number) => {
        const pages: number[] = [];
        const windowSize = Math.min(7, totalPages);
        let start = 1;

        if (totalPages > windowSize) {
            if (currentPage <= 4) {
                start = 1;
            } else if (currentPage >= totalPages - 3) {
                start = totalPages - windowSize + 1;
            } else {
                start = currentPage - 3;
            }
        }

        for (let i = 0; i < windowSize; i += 1) {
            pages.push(start + i);
        }

        return pages;
    };

    const openCreateModal = () => {
        if (readOnly) return;
        setEditingZone(null);
        setFormData({
            shippingMethodId: methods[0]?.id || '',
            county: '',
            cities: [{ cityTown: '', standardPrice: 0, expressPrice: undefined }],
        });
        setShowModal(true);
    };

    const openEditModal = (zone: ShippingZone) => {
        if (readOnly) return;
        setEditingZone(zone);
        setFormData({
            shippingMethodId: zone.shippingMethodId,
            county: zone.county,
            cities: zone.cities.map((c) => ({ ...c })),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingZone(null);
        setFormData({
            shippingMethodId: methods[0]?.id || '',
            county: '',
            cities: [{ cityTown: '', standardPrice: 0, expressPrice: undefined }],
        });
    };

    const addCity = () => {
        if (readOnly) return;
        setFormData((prev) => ({
            ...prev,
            cities: [...prev.cities, { cityTown: '', standardPrice: 0, expressPrice: undefined }],
        }));
    };

    const removeCity = (index: number) => {
        if (readOnly) return;
        setFormData((prev) => ({
            ...prev,
            cities: prev.cities.filter((_, i) => i !== index),
        }));
    };

    const updateCity = (index: number, field: 'cityTown' | 'standardPrice' | 'expressPrice', value: string) => {
        if (readOnly) return;
        const nextCities = [...formData.cities];

        if (field === 'standardPrice') {
            const amount = value === '' ? 0 : parseFloat(value);
            nextCities[index].standardPrice = Number.isNaN(amount) ? 0 : amount * 100;
        } else if (field === 'expressPrice') {
            const amount = value === '' ? 0 : parseFloat(value);
            nextCities[index].expressPrice = Number.isNaN(amount) || amount <= 0 ? undefined : amount * 100;
        } else {
            nextCities[index].cityTown = value;
        }

        setFormData((prev) => ({ ...prev, cities: nextCities }));
    };

    const handleSave = async () => {
        if (readOnly) return;

        if (!formData.shippingMethodId) {
            toast({ title: 'Validation Error', description: 'Shipping method is required.', variant: 'error' });
            return;
        }

        if (!formData.county.trim()) {
            toast({ title: 'Validation Error', description: 'County name is required.', variant: 'error' });
            return;
        }

        const validCities = formData.cities.filter((c) => c.cityTown.trim() && c.standardPrice > 0);
        if (validCities.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'At least one city with a valid standard price is required.',
                variant: 'error',
            });
            return;
        }

        try {
            const payload = {
                shippingMethodId: formData.shippingMethodId,
                county: formData.county,
                cities: validCities,
            };

            if (editingZone?.id) {
                await settingsService.updateShippingZone(editingZone.id, payload);
            } else {
                await settingsService.createShippingZone(payload);
            }

            toast({
                title: 'Success',
                description: editingZone ? 'Shipping zone updated.' : 'Shipping zone created.',
                variant: 'success',
            });
            closeModal();
            await fetchData();
        } catch (error) {
            console.error('Save error:', error);
            toast({ title: 'Error', description: 'Failed to save shipping zone.', variant: 'error' });
        }
    };

    const handleDeleteZone = async (zoneId: string) => {
        if (readOnly) return;

        try {
            await settingsService.deleteShippingZone(zoneId);

            toast({ title: 'Success', description: 'Shipping zone deleted.', variant: 'success' });
            await fetchData();
        } catch (error) {
            console.error('Delete zone error:', error);
            toast({ title: 'Error', description: 'Failed to delete shipping zone.', variant: 'error' });
        }
    };

    const handleDeleteCity = async (group: GroupedZone, city: ShippingCity) => {
        if (readOnly) return;
        const sourceZone = zones.find(
            (z) => z.county === group.zone.county && z.shippingMethodId === group.zone.shippingMethodId
        );

        if (!sourceZone?.id) return;

        if (sourceZone.cities.length <= 1) {
            await handleDeleteZone(sourceZone.id);
            return;
        }

        try {
            const updatedCities = sourceZone.cities.filter((c) => c.id !== city.id);
            await settingsService.updateShippingZone(sourceZone.id, {
                shippingMethodId: sourceZone.shippingMethodId,
                county: sourceZone.county,
                cities: updatedCities,
            });

            toast({ title: 'Success', description: 'City removed successfully.', variant: 'success' });
            await fetchData();
        } catch (error) {
            console.error('Delete city error:', error);
            toast({ title: 'Error', description: 'Failed to remove city.', variant: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
            </div>
        );
    }

    const groupedZones = getGroupedZones();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Shipping Zones</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure shipping zones and pricing for each county and city/town.</p>
                </div>
                {!readOnly ? (
                    <Button onClick={openCreateModal} className="bg-primary-800 hover:bg-primary-900 text-white">
                        <Plus className="w-4 h-4" />
                        Create Shipping Zone
                    </Button>
                ) : null}
            </div>

            <div className="space-y-3">
                {groupedZones.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">No shipping zones configured yet.</p>
                            {!readOnly ? <p className="text-sm text-gray-400 mt-1">Click "Create Shipping Zone" to get started.</p> : null}
                        </CardContent>
                    </Card>
                ) : (
                    groupedZones.map((group, groupIndex) => {
                        const countyKey = `${group.zone.county}-${group.zone.shippingMethodId}`;
                        const isExpanded = expandedCounties.has(countyKey);
                        const currentPage = getCurrentPage(countyKey);
                        const totalPages = getTotalPages(group.cities.length);
                        const paginatedCities = getPaginatedCities(group.cities, countyKey);

                        return (
                            <Card key={groupIndex}>
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleCounty(countyKey)}
                                            className="flex items-center gap-3 h-auto px-0 py-0 hover:bg-transparent flex-1 justify-start"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-500" />
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900">{group.zone.county}</h3>
                                            <Badge variant="secondary">{group.methodName}</Badge>
                                            <span className="text-sm text-gray-500">
                                                {group.cities.length} {group.cities.length === 1 ? 'city' : 'cities'}
                                            </span>
                                        </Button>

                                        <div className="flex items-center gap-2">
                                            {!readOnly ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(group.zone);
                                                        }}
                                                        title="Edit zone"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const confirmed = window.confirm(
                                                                `Delete all cities in ${group.zone.county}? This cannot be undone.`
                                                            );
                                                            if (!confirmed || !group.zone.id) return;
                                                            await handleDeleteZone(group.zone.id);
                                                        }}
                                                        title="Delete zone"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge variant="outline">View Only</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded ? (
                                        <div className="border-t border-gray-200">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>City/Town</TableHead>
                                                        <TableHead>Standard Price</TableHead>
                                                        <TableHead>Express Price</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedCities.map((city, index) => (
                                                        <TableRow key={city.id || index}>
                                                            <TableCell className="font-medium">{city.cityTown}</TableCell>
                                                            <TableCell>KES {(city.standardPrice / 100).toFixed(2)}</TableCell>
                                                            <TableCell>{city.expressPrice ? `KES ${(city.expressPrice / 100).toFixed(2)}` : '-'}</TableCell>
                                                            <TableCell className="text-right">
                                                                {!readOnly ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={async () => {
                                                                            const confirmed = window.confirm(
                                                                                `Delete ${city.cityTown} from ${group.zone.county}?`
                                                                            );
                                                                            if (!confirmed) return;
                                                                            await handleDeleteCity(group, city);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Badge variant="outline">View Only</Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {totalPages > 1 ? (
                                                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">
                                                        Showing {(currentPage - 1) * citiesPerPage + 1} to{' '}
                                                        {Math.min(currentPage * citiesPerPage, group.cities.length)} of {group.cities.length} cities
                                                    </span>

                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCountyPage(countyKey, currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        {getPageWindow(currentPage, totalPages).map((pageNum) => (
                                                            <Button
                                                                key={pageNum}
                                                                size="sm"
                                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                                onClick={() => setCountyPage(countyKey, pageNum)}
                                                                className={currentPage === pageNum ? 'bg-primary-800 hover:bg-primary-900 text-white' : ''}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCountyPage(countyKey, currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <Dialog open={showModal} onOpenChange={(open) => (!open ? closeModal() : setShowModal(true))}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}</DialogTitle>
                        <DialogDescription>Define a county and the cities served by the selected shipping method.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Shipping Method *</Label>
                            <Select
                                value={formData.shippingMethodId}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, shippingMethodId: value }))}
                                disabled={readOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shipping method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {methods.map((method) => (
                                        <SelectItem key={method.id} value={method.id}>
                                            {method.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shipping_county">County Name *</Label>
                            <Input
                                id="shipping_county"
                                type="text"
                                list="counties-list"
                                value={formData.county}
                                onChange={(e) => setFormData((prev) => ({ ...prev, county: e.target.value }))}
                                disabled={readOnly}
                                placeholder="Select existing or type new county"
                            />
                            <datalist id="counties-list">
                                {getUniqueCounties().map((county) => (
                                    <option key={county} value={county} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Cities/Towns & Pricing *</Label>
                                {!readOnly ? (
                                    <Button variant="ghost" size="sm" onClick={addCity}>
                                        <Plus className="w-4 h-4" />
                                        Add City/Town
                                    </Button>
                                ) : null}
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {formData.cities.map((city, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_160px_160px_auto] gap-3 items-center">
                                        <Input
                                            type="text"
                                            value={city.cityTown}
                                            onChange={(e) => updateCity(index, 'cityTown', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="City/Town name"
                                        />
                                        <Input
                                            type="number"
                                            value={city.standardPrice / 100}
                                            onChange={(e) => updateCity(index, 'standardPrice', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Standard price"
                                            step="0.01"
                                        />
                                        <Input
                                            type="number"
                                            value={city.expressPrice ? city.expressPrice / 100 : ''}
                                            onChange={(e) => updateCity(index, 'expressPrice', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Express price"
                                            step="0.01"
                                        />
                                        {!readOnly && formData.cities.length > 1 ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeCity(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>
                            {readOnly ? 'Close' : 'Cancel'}
                        </Button>
                        {!readOnly ? (
                            <Button onClick={handleSave} className="bg-primary-800 hover:bg-primary-900 text-white">
                                {editingZone ? 'Update Zone' : 'Create Zone'}
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
