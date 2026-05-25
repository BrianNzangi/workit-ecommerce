/**
 * GraphQL Schema Inspector
 * 
 * Use this to discover what queries your backend actually supports
 */

/**
 * Get all available queries from the backend
 */
export async function inspectBackendSchema() {
    console.log('🔍 Inspecting backend GraphQL schema...\n');

    const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType {
          fields {
            name
            description
            type {
              name
              kind
            }
          }
        }
      }
    }
  `;

    try {
        const response = await fetch('/api/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: introspectionQuery }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('❌ Introspection failed:', result.errors);
            return { success: false, error: result.errors };
        }

        const queries = result.data?.__schema?.queryType?.fields || [];

        console.log('✅ Available Queries:\n');
        queries.forEach((field: any) => {
            console.log(`  📌 ${field.name}`);
            if (field.description) {
                console.log(`     ${field.description}`);
            }
            console.log(`     Returns: ${field.type.name || field.type.kind}\n`);
        });

        return { success: true, queries };
    } catch (error) {
        console.error('❌ Introspection error:', error);
        return { success: false, error };
    }
}

/**
 * Test a simple query to verify connection
 */
export async function testConnection() {
    console.log('🔌 Testing GraphQL connection...\n');

    const query = `
    query {
      __typename
    }
  `;

    try {
        const response = await fetch('/api/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('❌ Connection test failed:', result.errors);
            return { success: false, error: result.errors };
        }

        console.log('✅ Connection successful!');
        console.log('   Response:', result.data);
        return { success: true, data: result.data };
    } catch (error) {
        console.error('❌ Connection error:', error);
        return { success: false, error };
    }
}

/**
 * Get detailed type information for a specific query
 */
export async function inspectQueryType(queryName: string) {
    console.log(`🔍 Inspecting query: ${queryName}\n`);

    const query = `
    query IntrospectType {
      __type(name: "${queryName}") {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

    try {
        const response = await fetch('/api/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('❌ Type inspection failed:', result.errors);
            return { success: false, error: result.errors };
        }

        const typeInfo = result.data?.__type;

        if (!typeInfo) {
            console.log(`❌ Type "${queryName}" not found in schema`);
            return { success: false, error: 'Type not found' };
        }

        console.log(`✅ Type: ${typeInfo.name} (${typeInfo.kind})\n`);
        console.log('Fields:');
        typeInfo.fields?.forEach((field: any) => {
            console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });

        return { success: true, typeInfo };
    } catch (error) {
        console.error('❌ Inspection error:', error);
        return { success: false, error };
    }
}

/**
 * Run all diagnostic tests
 */
export async function runDiagnostics() {
    console.log('🚀 Running GraphQL Diagnostics...\n');
    console.log('='.repeat(50) + '\n');

    // Test 1: Connection
    console.log('TEST 1: Connection Test');
    console.log('-'.repeat(50));
    await testConnection();
    console.log('\n');

    // Test 2: Schema Inspection
    console.log('TEST 2: Schema Inspection');
    console.log('-'.repeat(50));
    const schemaResult = await inspectBackendSchema();
    console.log('\n');

    // Test 3: Suggest fixes
    if (schemaResult.success && schemaResult.queries) {
        console.log('TEST 3: Query Suggestions');
        console.log('-'.repeat(50));

        const queries = schemaResult.queries as any[];
        const collectionQuery = queries.find(q =>
            q.name.toLowerCase().includes('collection')
        );
        const bannerQuery = queries.find(q =>
            q.name.toLowerCase().includes('banner')
        );

        if (collectionQuery) {
            console.log(`✅ Found collections query: "${collectionQuery.name}"`);
            console.log(`   Update COLLECTIONS_QUERY to use: ${collectionQuery.name}`);
        } else {
            console.log('❌ No collections query found in schema');
            console.log('   You need to add a collections query to your backend');
        }

        if (bannerQuery) {
            console.log(`✅ Found banners query: "${bannerQuery.name}"`);
            console.log(`   Update BANNERS_QUERY to use: ${bannerQuery.name}`);
        } else {
            console.log('❌ No banners query found in schema');
            console.log('   You need to add a banners query to your backend');
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Diagnostics complete!');
}

// Browser console usage:
// import { runDiagnostics, inspectBackendSchema } from '@/lib/testing/graphql-inspector';
// runDiagnostics();
