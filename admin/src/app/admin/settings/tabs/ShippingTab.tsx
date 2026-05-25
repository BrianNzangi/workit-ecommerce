'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Truck, MapPin, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
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
    methodCode: string;
    isExpress: boolean;
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
        cities: [{ cityTown: '', standardPrice: 0, expressPrice: 0 }] as ShippingCity[],
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await settingsService.getShippingMethods();
            setMethods(data || []);

            const allZones: ShippingZone[] = [];
            (data || []).forEach((method: ShippingMethod) => {
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
                    methodCode: method?.code || '',
                    isExpress: method?.isExpress || false,
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
        const windowSize = Math.min(5, totalPages);
        let start = 1;

        if (totalPages > windowSize) {
            if (currentPage <= 3) {
                start = 1;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - windowSize + 1;
            } else {
                start = currentPage - 2;
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
        setFormError('');
        setFormData({
            shippingMethodId: methods[0]?.id || '',
            county: '',
            cities: [{ cityTown: '', standardPrice: 0, expressPrice: 0 }],
        });
        setShowModal(true);
    };

    const openEditModal = (zone: ShippingZone) => {
        if (readOnly) return;
        setEditingZone(zone);
        setFormError('');
        setFormData({
            shippingMethodId: zone.shippingMethodId,
            county: zone.county,
            cities: zone.cities.map((c) => ({
                cityTown: c.cityTown,
                standardPrice: c.standardPrice,
                expressPrice: c.expressPrice || 0,
            })),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingZone(null);
        setFormError('');
        setFormData({
            shippingMethodId: methods[0]?.id || '',
            county: '',
            cities: [{ cityTown: '', standardPrice: 0, expressPrice: 0 }],
        });
    };

    const addCity = () => {
        if (readOnly) return;
        setFormData((prev) => ({
            ...prev,
            cities: [...prev.cities, { cityTown: '', standardPrice: 0, expressPrice: 0 }],
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

        if (field === 'standardPrice' || field === 'expressPrice') {
            const amount = value === '' ? 0 : parseFloat(value);
            nextCities[index][field] = Number.isNaN(amount) ? 0 : Math.round(amount * 100);
        } else {
            nextCities[index].cityTown = value;
        }

        setFormData((prev) => ({ ...prev, cities: nextCities }));
    };

    const handleSave = async () => {
        if (readOnly) return;
        setFormError('');

        if (!formData.shippingMethodId) {
            setFormError('Shipping method is required.');
            return;
        }

        if (!formData.county.trim()) {
            setFormError('County name is required.');
            return;
        }

        const validCities = formData.cities.filter((c) => c.cityTown.trim());
        if (validCities.length === 0) {
            setFormError('At least one city is required.');
            return;
        }

        const invalidCity = validCities.find((c) => c.standardPrice <= 0);
        if (invalidCity) {
            setFormError(`Standard price for "${invalidCity.cityTown}" must be greater than 0.`);
            return;
        }

        const payload = {
            shippingMethodId: formData.shippingMethodId,
            county: formData.county.trim(),
            cities: validCities.map((c) => ({
                cityTown: c.cityTown.trim(),
                standardPrice: c.standardPrice,
                expressPrice: c.expressPrice || 0,
            })),
        };

        try {
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
        } catch (error: any) {
            console.error('Save error:', error);
            setFormError(error?.message || 'Failed to save shipping zone.');
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
                cities: updatedCities.map((c) => ({
                    cityTown: c.cityTown,
                    standardPrice: c.standardPrice,
                    expressPrice: c.expressPrice || 0,
                })),
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800"></div>
            </div>
        );
    }

    const groupedZones = getGroupedZones();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Zones</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Configure shipping zones and pricing for each county and city.</p>
                </div>
                {!readOnly && (
                    <Button onClick={openCreateModal} className="bg-primary-800 hover:bg-primary-900 text-white h-9">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create Zone
                    </Button>
                )}
            </div>

            {groupedZones.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                    <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">No shipping zones yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first shipping zone to get started</p>
                    {!readOnly && (
                        <Button onClick={openCreateModal} variant="outline" className="h-9">
                            <Plus className="w-4 h-4 mr-1.5" />
                            Create Zone
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {groupedZones.map((group, groupIndex) => {
                        const countyKey = `${group.zone.county}-${group.zone.shippingMethodId}`;
                        const isExpanded = expandedCounties.has(countyKey);
                        const currentPage = getCurrentPage(countyKey);
                        const totalPages = getTotalPages(group.cities.length);
                        const paginatedCities = getPaginatedCities(group.cities, countyKey);

                        return (
                            <div key={groupIndex} className="bg-white rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <button
                                        onClick={() => toggleCounty(countyKey)}
                                        className="flex items-center gap-2.5 flex-1 justify-start text-left"
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-900">{group.zone.county}</h3>
                                        <Badge variant="secondary" className="text-xs h-5 px-1.5">{group.methodName}</Badge>
                                        {group.isExpress && <Badge variant="info" className="text-xs h-5 px-1.5">Express</Badge>}
                                        <span className="text-xs text-gray-500">
                                            {group.cities.length} {group.cities.length === 1 ? 'city' : 'cities'}
                                        </span>
                                    </button>

                                    {!readOnly && (
                                        <div className="flex items-center gap-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(group.zone);
                                                }}
                                                title="Edit zone"
                                                className="h-7 w-7"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!group.zone.id) return;
                                                    const confirmed = window.confirm(
                                                        `Delete all cities in ${group.zone.county}? This cannot be undone.`
                                                    );
                                                    if (!confirmed) return;
                                                    await handleDeleteZone(group.zone.id);
                                                }}
                                                title="Delete zone"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {isExpanded && (
                                    <div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="h-8">City/Town</TableHead>
                                                    <TableHead className="h-8">Standard Price</TableHead>
                                                    <TableHead className="h-8">Express Price</TableHead>
                                                    {!readOnly && <TableHead className="h-8 text-right">Actions</TableHead>}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedCities.map((city, index) => (
                                                    <TableRow key={city.id || index}>
                                                        <TableCell className="py-2 font-medium text-sm">{city.cityTown}</TableCell>
                                                        <TableCell className="py-2 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3 text-gray-400" />
                                                                {(city.standardPrice / 100).toFixed(2)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-sm">
                                                            {city.expressPrice && city.expressPrice > 0 ? (
                                                                <div className="flex items-center gap-1">
                                                                    <DollarSign className="w-3 h-3 text-gray-400" />
                                                                    {(city.expressPrice / 100).toFixed(2)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </TableCell>
                                                        {!readOnly && (
                                                            <TableCell className="py-2 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                                                                    onClick={async () => {
                                                                        const confirmed = window.confirm(
                                                                            `Remove ${city.cityTown} from ${group.zone.county}?`
                                                                        );
                                                                        if (!confirmed) return;
                                                                        await handleDeleteCity(group, city);
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {totalPages > 1 && (
                                            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                                                <span className="text-xs text-gray-600">
                                                    Showing {(currentPage - 1) * citiesPerPage + 1} to{' '}
                                                    {Math.min(currentPage * citiesPerPage, group.cities.length)} of {group.cities.length}
                                                </span>
                                                <div className="flex items-center gap-0.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCountyPage(countyKey, currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="h-7 text-xs px-2"
                                                    >
                                                        Previous
                                                    </Button>
                                                    {getPageWindow(currentPage, totalPages).map((pageNum) => (
                                                        <Button
                                                            key={pageNum}
                                                            size="sm"
                                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                                            onClick={() => setCountyPage(countyKey, pageNum)}
                                                            className={currentPage === pageNum ? 'bg-primary-800 hover:bg-primary-900 text-white h-7 w-7 p-0 text-xs' : 'h-7 w-7 p-0 text-xs'}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCountyPage(countyKey, currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="h-7 text-xs px-2"
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={showModal} onOpenChange={(open) => (!open ? closeModal() : setShowModal(true))}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}</DialogTitle>
                        <DialogDescription>Define a county and the cities served by the selected shipping method.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {formError && (
                            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Shipping Method</Label>
                            <Select
                                value={formData.shippingMethodId}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, shippingMethodId: value }))}
                                disabled={readOnly}
                            >
                                <SelectTrigger className="h-9">
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
                            <Label htmlFor="shipping_county">County</Label>
                            <Input
                                id="shipping_county"
                                type="text"
                                list="counties-list"
                                value={formData.county}
                                onChange={(e) => setFormData((prev) => ({ ...prev, county: e.target.value }))}
                                disabled={readOnly}
                                placeholder="Select existing or type new county"
                                className="h-9"
                            />
                            <datalist id="counties-list">
                                {getUniqueCounties().map((county) => (
                                    <option key={county} value={county} />
                                ))}
                            </datalist>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Cities & Pricing</Label>
                                {!readOnly && (
                                    <Button variant="ghost" size="sm" onClick={addCity} className="h-7 text-xs">
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Add City
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {formData.cities.map((city, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                        <div className="col-span-12 sm:col-span-5">
                                            <Input
                                                type="text"
                                                value={city.cityTown}
                                                onChange={(e) => updateCity(index, 'cityTown', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="City/Town name"
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-5 sm:col-span-3">
                                            <Input
                                                type="number"
                                                value={city.standardPrice / 100}
                                                onChange={(e) => updateCity(index, 'standardPrice', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="Standard"
                                                step="0.01"
                                                min="0"
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-5 sm:col-span-3">
                                            <Input
                                                type="number"
                                                value={city.expressPrice ? city.expressPrice / 100 : ''}
                                                onChange={(e) => updateCity(index, 'expressPrice', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="Express (optional)"
                                                step="0.01"
                                                min="0"
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        {!readOnly && formData.cities.length > 1 && (
                                            <div className="col-span-2 sm:col-span-1 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCity(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-0.5">
                                <div className="col-span-12 sm:col-span-5">City name</div>
                                <div className="col-span-5 sm:col-span-3">Standard price (KES)</div>
                                <div className="col-span-5 sm:col-span-3">Express price (KES)</div>
                                <div className="col-span-2 sm:col-span-1" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal} className="h-9">
                            {readOnly ? 'Close' : 'Cancel'}
                        </Button>
                        {!readOnly && (
                            <Button onClick={handleSave} className="bg-primary-800 hover:bg-primary-900 text-white h-9">
                                {editingZone ? 'Update Zone' : 'Create Zone'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
