'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function StorefrontAPIDocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Storefront API Documentation
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    GraphQL API for the Workit e-commerce storefront
                </p>
            </div>

            <div className="swagger-container">
                <SwaggerUI
                    url="/api/docs/store-openapi"
                    docExpansion="list"
                    defaultModelsExpandDepth={1}
                    defaultModelExpandDepth={1}
                />
            </div>

            <style jsx global>{`
                .swagger-container {
                    max-width: 100%;
                }
                
                .swagger-ui .topbar {
                    display: none;
                }
                
                .swagger-ui .info {
                    margin: 20px 0;
                }
                
                .swagger-ui .scheme-container {
                    background: #fafafa;
                    padding: 20px;
                    margin: 20px 0;
                }
            `}</style>
        </div>
    );
}
