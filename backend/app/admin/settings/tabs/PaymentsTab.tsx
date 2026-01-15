'use client';

import { AlertCircle } from 'lucide-react';
import { Settings } from './index';

interface PaymentsTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

export default function PaymentsTab({ settings, setSettings }: PaymentsTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Paystack Integration
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-xs p-4 mb-6">
                    <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                                Get your Paystack API keys
                            </p>
                            <p>
                                You can find your API keys in your Paystack Dashboard
                                under Settings → API Keys & Webhooks
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={settings.payments.paystack_enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        payments: {
                                            ...settings.payments,
                                            paystack_enabled: e.target.checked,
                                        },
                                    })
                                }
                                className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Enable Paystack Payments
                            </span>
                        </label>
                    </div>
                    {settings.payments.paystack_enabled && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Public Key *
                                </label>
                                <input
                                    type="text"
                                    value={settings.payments.paystack_public_key}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            payments: {
                                                ...settings.payments,
                                                paystack_public_key: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent font-mono text-sm"
                                    placeholder="pk_test_xxxxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Secret Key *
                                </label>
                                <input
                                    type="password"
                                    value={settings.payments.paystack_secret_key}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            payments: {
                                                ...settings.payments,
                                                paystack_secret_key: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent font-mono text-sm"
                                    placeholder="sk_test_xxxxxxxxxxxx"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Keep this key secure and never share it publicly
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
