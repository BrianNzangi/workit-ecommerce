'use client';

import { useState } from 'react';
import { testCollections, testBanners, testHomeCollections, testGraphQL, testAllAPIs } from '@/lib/api-test';

/**
 * API Test Page
 * 
 * Visit /api-test to run GraphQL API integration tests
 * This helps verify that the storefront is correctly connected to the backend
 */
export default function APITestPage() {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTests = async () => {
        setLoading(true);
        setResults(null);

        try {
            const testResults = await testAllAPIs();
            setResults(testResults);
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const runCollectionsTest = async () => {
        setLoading(true);
        setResults(null);

        try {
            const result = await testCollections();
            setResults({ collections: result });
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const runBannersTest = async () => {
        setLoading(true);
        setResults(null);

        try {
            const result = await testBanners();
            setResults({ banners: result });
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const runHomeCollectionsTest = async () => {
        setLoading(true);
        setResults(null);

        try {
            const result = await testHomeCollections();
            setResults({ homeCollections: result });
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        API Integration Test
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Test the connection between the storefront and backend API
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={runTests}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Running Tests...' : 'Run All Tests'}
                            </button>

                            <button
                                onClick={runCollectionsTest}
                                disabled={loading}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Test Collections
                            </button>

                            <button
                                onClick={runBannersTest}
                                disabled={loading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Test Banners
                            </button>

                            <button
                                onClick={runHomeCollectionsTest}
                                disabled={loading}
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Test Home Collections
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>

                            {results.collections && (
                                <div className="border rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        {results.collections.success ? '✅' : '❌'}
                                        Collections Query
                                    </h3>
                                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                                        {JSON.stringify(results.collections, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {results.banners && (
                                <div className="border rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        {results.banners.success ? '✅' : '❌'}
                                        Banners Query
                                    </h3>
                                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                                        {JSON.stringify(results.banners, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {results.homeCollections && (
                                <div className="border rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        {results.homeCollections.success ? '✅' : '❌'}
                                        Home Collections Query
                                    </h3>
                                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                                        {JSON.stringify(results.homeCollections, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {results.products && (
                                <div className="border rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        {results.products.success ? '✅' : '❌'}
                                        Products Query
                                    </h3>
                                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                                        {JSON.stringify(results.products, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">GraphQL Endpoint:</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>
                                <strong>All Queries:</strong> POST http://localhost:3001/api/store
                            </li>
                        </ul>
                        <p className="mt-4 text-sm text-blue-700">
                            All storefront data (collections, banners, products, cart, orders) is fetched through the GraphQL endpoint.
                        </p>
                        <p className="mt-2 text-sm text-blue-700">
                            Make sure your backend is running on port 3001 before running these tests.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
