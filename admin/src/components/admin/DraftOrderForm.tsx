'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Search, User } from 'lucide-react';
import Link from 'next/link';

interface OrderLine {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
}

interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export function DraftOrderForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [searchingCustomer, setSearchingCustomer] = useState(false);

    const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [shippingCost, setShippingCost] = useState('0');
    const [taxRate, setTaxRate] = useState('16'); // 16% VAT
    const [notes, setNotes] = useState('');

    const addOrderLine = () => {
        setOrderLines([
            ...orderLines,
            {
                id: Date.now().toString(),
                productName: '',
                variantName: '',
                quantity: 1,
                price: 0,
            },
        ]);
    };

    const removeOrderLine = (id: string) => {
        setOrderLines(orderLines.filter((line) => line.id !== id));
    };

    const updateOrderLine = (id: string, field: keyof OrderLine, value: any) => {
        setOrderLines(
            orderLines.map((line) =>
                line.id === id ? { ...line, [field]: value } : line
            )
        );
    };

    const calculateSubtotal = () => {
        return orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    };

    const calculateTax = () => {
        const subtotal = calculateSubtotal();
        return (subtotal * parseFloat(taxRate)) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + parseFloat(shippingCost) + calculateTax();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customer) {
            setError('Please select a customer');
            return;
        }

        if (orderLines.length === 0) {
            setError('Please add at least one product');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // TODO: Implement API call to create draft order
            console.log('Creating draft order:', {
                customer,
                orderLines,
                shippingCost,
                taxRate,
                notes,
            });

            // Placeholder - redirect after creation
            setTimeout(() => {
                router.push('/admin/orders/drafts');
            }, 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <Link
                    href="/admin/orders/drafts"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Draft Orders
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create Draft Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Selection */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>

                            {customer ? (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xs border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#FF5023] rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">{customer.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCustomer(null)}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            placeholder="Search customers by email or name..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Search for an existing customer or create a new one
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                                <button
                                    type="button"
                                    onClick={addOrderLine}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </button>
                            </div>

                            {orderLines.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xs">
                                    <p className="text-gray-500">No products added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orderLines.map((line) => (
                                        <div
                                            key={line.id}
                                            className="p-4 border border-gray-200 rounded-xs bg-gray-50"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Product Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={line.productName}
                                                            onChange={(e) =>
                                                                updateOrderLine(line.id, 'productName', e.target.value)
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                                            placeholder="Enter product name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Variant
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={line.variantName}
                                                            onChange={(e) =>
                                                                updateOrderLine(line.id, 'variantName', e.target.value)
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                                            placeholder="e.g., Size M, Red"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={line.quantity}
                                                            onChange={(e) =>
                                                                updateOrderLine(
                                                                    line.id,
                                                                    'quantity',
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            min="1"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Price (KES)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={line.price}
                                                            onChange={(e) =>
                                                                updateOrderLine(
                                                                    line.id,
                                                                    'price',
                                                                    parseFloat(e.target.value)
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeOrderLine(line.id)}
                                                    className="mt-8 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">KES {calculateSubtotal().toFixed(2)}</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shipping
                                    </label>
                                    <input
                                        type="number"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                    />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">KES {calculateTax().toFixed(2)}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-[#FF5023]">
                                            KES {calculateTotal().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent text-sm"
                                placeholder="Add notes about this order..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs font-medium"
                            >
                                {loading ? 'Creating...' : 'Create Draft Order'}
                            </button>
                            <Link
                                href="/admin/orders/drafts"
                                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
