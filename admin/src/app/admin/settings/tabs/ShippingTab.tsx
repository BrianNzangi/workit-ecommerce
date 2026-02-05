'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, X, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShippingCity {
    id?: string;
    cityTown: string;
    standardPrice: number; // in cents
    expressPrice?: number; // in cents (optional)
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
}

interface ShippingTabProps {
    readOnly?: boolean;
}

export default function ShippingTab({ readOnly = false }: ShippingTabProps) {
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

    // Pagination and collapsible state
    const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
    const [countyPages, setCountyPages] = useState<{ [key: string]: number }>({});
    const citiesPerPage = 20;

    // Modal form state
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
            const response = await fetch('/api/admin/shipping-methods');
            if (response.ok) {
                const data = await response.json();
                setMethods(data);

                // Flatten zones from all methods - backend returns methods with nested zones and cities
                const allZones: ShippingZone[] = [];
                data.forEach((method: any) => {
                    if (method.zones) {
                        method.zones.forEach((zone: any) => {
                            allZones.push({
                                ...zone,
                                shippingMethodId: method.id,
                                cities: zone.cities || []
                            });
                        });
                    }
                });
                setZones(allZones);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load shipping data',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Group zones by county and shipping method
    const getGroupedZones = () => {
        const grouped: { [key: string]: { zone: ShippingZone; cities: ShippingCity[] } } = {};

        zones.forEach(zone => {
            const key = `${zone.county}-${zone.shippingMethodId}`;
            if (!grouped[key]) {
                grouped[key] = {
                    zone: { ...zone, cities: [] },
                    cities: []
                };
            }
            grouped[key].cities.push(...zone.cities);
        });

        return Object.values(grouped);
    };

    // Get unique counties from existing zones
    const getUniqueCounties = (): string[] => {
        const counties = zones.map(z => z.county);
        return Array.from(new Set(counties)).sort();
    };

    // Toggle county expansion
    const toggleCounty = (countyKey: string) => {
        const newExpanded = new Set(expandedCounties);
        if (newExpanded.has(countyKey)) {
            newExpanded.delete(countyKey);
        } else {
            newExpanded.add(countyKey);
        }
        setExpandedCounties(newExpanded);
    };

    // Get current page for a county
    const getCurrentPage = (countyKey: string) => {
        return countyPages[countyKey] || 1;
    };

    // Set page for a county
    const setCountyPage = (countyKey: string, page: number) => {
        setCountyPages(prev => ({ ...prev, [countyKey]: page }));
    };

    // Get paginated cities for a county
    const getPaginatedCities = (cities: ShippingCity[], countyKey: string) => {
        const currentPage = getCurrentPage(countyKey);
        const startIndex = (currentPage - 1) * citiesPerPage;
        const endIndex = startIndex + citiesPerPage;
        return cities.slice(startIndex, endIndex);
    };

    // Get total pages for a county
    const getTotalPages = (citiesCount: number) => {
        return Math.ceil(citiesCount / citiesPerPage);
    };

    const openCreateModal = () => {
        if (readOnly) return;
        setEditingZone(null);
        setFormData({
            shippingMethodId: methods[0]?.id || 'standard', // Use default method
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
            cities: zone.cities.map(c => ({ ...c })),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingZone(null);
        setFormData({
            shippingMethodId: '',
            county: '',
            cities: [{ cityTown: '', standardPrice: 0, expressPrice: undefined }],
        });
    };

    const addCity = () => {
        if (readOnly) return;
        setFormData({
            ...formData,
            cities: [...formData.cities, { cityTown: '', standardPrice: 0, expressPrice: undefined }],
        });
    };

    const removeCity = (index: number) => {
        if (readOnly) return;
        setFormData({
            ...formData,
            cities: formData.cities.filter((_, i) => i !== index),
        });
    };

    const updateCity = (index: number, field: 'cityTown' | 'standardPrice' | 'expressPrice', value: string) => {
        if (readOnly) return;
        const newCities = [...formData.cities];
        if (field === 'standardPrice') {
            newCities[index].standardPrice = parseFloat(value) * 100; // Convert to cents
        } else if (field === 'expressPrice') {
            const numValue = parseFloat(value);
            newCities[index].expressPrice = numValue > 0 ? numValue * 100 : undefined; // Convert to cents or undefined
        } else {
            newCities[index].cityTown = value;
        }
        setFormData({ ...formData, cities: newCities });
    };

    const handleSave = async () => {
        if (readOnly) return;

        // Validation
        if (!formData.county.trim()) {
            toast({
                title: 'Validation Error',
                description: 'County name is required',
                variant: 'error',
            });
            return;
        }

        const validCities = formData.cities.filter(c => c.cityTown.trim() && c.standardPrice > 0);
        if (validCities.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'At least one city with valid standard price is required',
                variant: 'error',
            });
            return;
        }

        try {
            const zoneData = {
                shippingMethodId: formData.shippingMethodId,
                county: formData.county,
                cities: validCities,
            };

            let response;
            if (editingZone?.id) {
                // Update existing zone
                response = await fetch(`/api/admin/shipping-zones/${editingZone.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(zoneData),
                });
            } else {
                // Create new zone
                response = await fetch('/api/admin/shipping-zones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(zoneData),
                });
            }

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: editingZone ? 'Shipping zone updated' : 'Shipping zone created',
                    variant: 'default',
                });
                closeModal();
                await fetchData();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save shipping zone',
                variant: 'error',
            });
        }
    };

    const handleDelete = async (zoneId: string) => {
        if (readOnly) return;

        try {
            const response = await fetch(`/api/admin/shipping-zones/${zoneId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Shipping zone deleted',
                    variant: 'default',
                });
                await fetchData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete shipping zone.',
                variant: 'error',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Shipping Zones</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure shipping zones and pricing for each county and city/town
                    </p>
                </div>
                {!readOnly && (
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Create Shipping Zone
                    </button>
                )}
            </div>

            {/* Zones List */}
            <div className="space-y-3">
                {zones.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No shipping zones configured yet.</p>
                        {!readOnly && <p className="text-sm text-gray-400 mt-1">Click "Create Shipping Zone" to get started.</p>}
                    </div>
                ) : (
                    getGroupedZones().map((group, groupIndex) => {
                        const countyKey = `${group.zone.county}-${group.zone.shippingMethodId}`;
                        const isExpanded = expandedCounties.has(countyKey);
                        const currentPage = getCurrentPage(countyKey);
                        const totalPages = getTotalPages(group.cities.length);
                        const paginatedCities = getPaginatedCities(group.cities, countyKey);

                        return (
                            <div key={groupIndex} className="bg-white rounded-xs shadow-xs border border-gray-200">
                                {/* County Header - Collapsible */}
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <button
                                        onClick={() => toggleCounty(countyKey)}
                                        className="flex items-center gap-3 flex-1"
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900">{group.zone.county}</h3>
                                        <span className="text-sm text-gray-500">
                                            {group.cities.length} {group.cities.length === 1 ? 'city' : 'cities'}
                                        </span>
                                    </button>

                                    {/* Zone Actions */}
                                    <div className="flex items-center gap-2">
                                        {!readOnly && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(group.zone);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-primary-800 hover:bg-gray-100 rounded-xs transition-colors"
                                                    title="Edit zone"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const confirmed = window.confirm(`Delete all cities in ${group.zone.county}? This cannot be undone.`);
                                                        if (!confirmed) return;
                                                        await handleDelete(group.zone.id!);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                                                    title="Delete zone"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {readOnly && (
                                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">View Only</span>
                                        )}
                                    </div>
                                </div>

                                {/* Cities List - Collapsible Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200">
                                        {/* Cities Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            City/Town
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Standard Price
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Express Price
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paginatedCities.map((city: ShippingCity, index: number) => (
                                                        <tr key={city.id || index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{city.cityTown}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    KES {(city.standardPrice / 100).toFixed(2)}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {city.expressPrice ? `KES ${(city.expressPrice / 100).toFixed(2)}` : '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {!readOnly && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const singleCityZone = {
                                                                                        ...group.zone,
                                                                                        cities: [city]
                                                                                    };
                                                                                    openEditModal(singleCityZone);
                                                                                }}
                                                                                className="text-gray-600 hover:text-primary-800 transition-colors"
                                                                                title="Edit city"
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    const confirmed = window.confirm(`Delete ${city.cityTown} from ${group.zone.county}?`);
                                                                                    if (!confirmed) return;

                                                                                    const originalZone = zones.find(z =>
                                                                                        z.county === group.zone.county &&
                                                                                        z.shippingMethodId === group.zone.shippingMethodId &&
                                                                                        z.cities.some((c: ShippingCity) => c.id === city.id)
                                                                                    );

                                                                                    if (!originalZone) return;

                                                                                    if (originalZone.cities.length === 1) {
                                                                                        await handleDelete(originalZone.id!);
                                                                                    } else {
                                                                                        const updatedCities = originalZone.cities.filter((c: ShippingCity) => c.id !== city.id);
                                                                                        try {
                                                                                            const response = await fetch(`/api/admin/shipping-zones/${originalZone.id}`, {
                                                                                                method: 'PATCH',
                                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                                body: JSON.stringify({
                                                                                                    shippingMethodId: originalZone.shippingMethodId,
                                                                                                    county: originalZone.county,
                                                                                                    cities: updatedCities,
                                                                                                }),
                                                                                            });

                                                                                            if (response.ok) {
                                                                                                toast({
                                                                                                    title: 'Success',
                                                                                                    description: 'City removed successfully',
                                                                                                    variant: 'default',
                                                                                                });
                                                                                                await fetchData();
                                                                                            }
                                                                                        } catch (error) {
                                                                                            toast({
                                                                                                title: 'Error',
                                                                                                description: 'Failed to remove city',
                                                                                                variant: 'error',
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                                                                title="Delete city"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {readOnly && (
                                                                        <span className="text-xs text-gray-400">View Only</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">
                                                        Showing {((currentPage - 1) * citiesPerPage) + 1} to {Math.min(currentPage * citiesPerPage, group.cities.length)} of {group.cities.length} cities
                                                    </span>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setCountyPage(countyKey, currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                            className="px-3 py-1 border border-gray-300 rounded-xs text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Previous
                                                        </button>

                                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                            let pageNum;
                                                            if (totalPages <= 7) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage <= 4) {
                                                                pageNum = i + 1;
                                                            } else if (currentPage >= totalPages - 3) {
                                                                pageNum = totalPages - 6 + i;
                                                            } else {
                                                                pageNum = currentPage - 3 + i;
                                                            }

                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setCountyPage(countyKey, pageNum)}
                                                                    className={`px-3 py-1 border rounded-xs text-sm transition-colors ${currentPage === pageNum
                                                                        ? 'bg-primary-800 text-white border-primary-800'
                                                                        : 'border-gray-300 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}

                                                        <button
                                                            onClick={() => setCountyPage(countyKey, currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                            className="px-3 py-1 border border-gray-300 rounded-xs text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xs shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xs transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    County Name *
                                </label>
                                <input
                                    type="text"
                                    list="counties-list"
                                    value={formData.county}
                                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                    disabled={readOnly}
                                    placeholder="Select existing or type new county"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                />
                                <datalist id="counties-list">
                                    {getUniqueCounties().map((county, index) => (
                                        <option key={index} value={county} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cities/Towns & Pricing *
                                    </label>
                                    {!readOnly && (
                                        <button
                                            onClick={addCity}
                                            type="button"
                                            className="inline-flex items-center gap-1 text-sm text-primary-800 hover:text-primary-900"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add City/Town
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {formData.cities.map((city, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={city.cityTown}
                                                onChange={(e) => updateCity(index, 'cityTown', e.target.value)}
                                                disabled={readOnly}
                                                placeholder="City/Town name"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            />
                                            <div className="relative w-40">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                                    Standard
                                                </span>
                                                <input
                                                    type="number"
                                                    value={city.standardPrice / 100}
                                                    onChange={(e) => updateCity(index, 'standardPrice', e.target.value)}
                                                    disabled={readOnly}
                                                    placeholder="400"
                                                    step="0.01"
                                                    className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="relative w-40">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                                    Express
                                                </span>
                                                <input
                                                    type="number"
                                                    value={city.expressPrice ? city.expressPrice / 100 : ''}
                                                    onChange={(e) => updateCity(index, 'expressPrice', e.target.value)}
                                                    disabled={readOnly}
                                                    placeholder="500"
                                                    step="0.01"
                                                    className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            {!readOnly && formData.cities.length > 1 && (
                                                <button
                                                    onClick={() => removeCity(index)}
                                                    type="button"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                type="button"
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors"
                            >
                                {readOnly ? 'Close' : 'Cancel'}
                            </button>
                            {!readOnly && (
                                <button
                                    onClick={handleSave}
                                    type="button"
                                    className="px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xs transition-colors shadow-xs"
                                >
                                    {editingZone ? 'Update Zone' : 'Create Zone'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
