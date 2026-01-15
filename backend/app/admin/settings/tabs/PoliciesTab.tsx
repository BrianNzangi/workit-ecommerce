'use client';

import { AlertCircle } from 'lucide-react';
import { Settings } from './index';

interface PoliciesTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

export default function PoliciesTab({ settings, setSettings }: PoliciesTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Store Policies
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Policies are linked in the footer of checkout and can be added
                    to your online store menu
                </p>
                <div className="space-y-6">
                    {/* Return Policy */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Return and refund policy
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {settings.policies.return_policy
                                    ? 'Set'
                                    : 'No policy set'}
                            </span>
                        </div>
                        <textarea
                            value={settings.policies.return_policy}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    policies: {
                                        ...settings.policies,
                                        return_policy: e.target.value,
                                    },
                                })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="Enter your return and refund policy..."
                        />
                    </div>

                    {/* Privacy Policy */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Privacy policy
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                    Enabled
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Automated
                                </span>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={settings.policies.privacy_policy_enabled}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        policies: {
                                            ...settings.policies,
                                            privacy_policy_enabled:
                                                e.target.checked,
                                        },
                                    })
                                }
                                className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                            />
                            <span className="text-sm text-gray-700">
                                Enable privacy policy
                            </span>
                        </label>
                        <textarea
                            value={settings.policies.privacy_policy}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    policies: {
                                        ...settings.policies,
                                        privacy_policy: e.target.value,
                                    },
                                })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="Enter your privacy policy..."
                        />
                    </div>

                    {/* Terms of Service */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Terms of service
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {settings.policies.terms_of_service
                                    ? 'Set'
                                    : 'No policy set'}
                            </span>
                        </div>
                        <textarea
                            value={settings.policies.terms_of_service}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    policies: {
                                        ...settings.policies,
                                        terms_of_service: e.target.value,
                                    },
                                })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="Enter your terms of service..."
                        />
                    </div>

                    {/* Shipping Policy */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Shipping policy
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {settings.policies.shipping_policy
                                    ? 'Set'
                                    : 'No policy set'}
                            </span>
                        </div>
                        <textarea
                            value={settings.policies.shipping_policy}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    policies: {
                                        ...settings.policies,
                                        shipping_policy: e.target.value,
                                    },
                                })
                            }
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                            placeholder="Enter your shipping policy..."
                        />
                    </div>

                    {/* Contact Information */}
                    <div className="border border-yellow-200 bg-yellow-50 rounded-xs p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Contact information
                                </h3>
                                <p className="text-sm text-gray-700 mb-2">
                                    Required - Contact information must be provided
                                    for legal compliance
                                </p>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.policies.contact_required}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                policies: {
                                                    ...settings.policies,
                                                    contact_required:
                                                        e.target.checked,
                                                },
                                            })
                                        }
                                        className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Require contact information at checkout
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
