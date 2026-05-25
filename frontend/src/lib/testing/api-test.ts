/**
 * API Test Utility
 * 
 * Use this in your browser console or in a test component to verify
 * that the GraphQL API endpoints are working correctly.
 */

/**
 * Test collections query
 */
export async function testCollections() {
    console.log('🧪 Testing Collections Query...');

    const query = `
    query GetCollections {
      collections {
        id
        name
        slug
        children {
          id
          name
          slug
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

        const data = await response.json();

        if (response.ok && !data.errors) {
            console.log('✅ Collections Query working!');
            console.log('📦 Collections:', data.data?.collections);
            return { success: true, data };
        } else {
            console.error('❌ Collections Query failed:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ Collections Query error:', error);
        return { success: false, error };
    }
}

/**
 * Test banners query
 */
export async function testBanners() {
    console.log('🧪 Testing Banners Query...');

    const query = `
    query GetBanners {
      banners {
        id
        title
        slug
        image
      }
    }
  `;

    try {
        const response = await fetch('/api/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        if (response.ok && !data.errors) {
            console.log('✅ Banners Query working!');
            console.log('📦 Banners:', data.data?.banners);
            return { success: true, data };
        } else {
            console.error('❌ Banners Query failed:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ Banners Query error:', error);
        return { success: false, error };
    }
}

/**
 * Test home collections query
 */
export async function testHomeCollections() {
    console.log('🧪 Testing Home Collections Query...');

    const query = `
    query GetHomeCollections {
      homeCollections {
        id
        title
        slug
        products {
          id
          name
          price
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

        const data = await response.json();

        if (response.ok && !data.errors) {
            console.log('✅ Home Collections Query working!');
            console.log('📦 Home Collections:', data.data?.homeCollections);
            return { success: true, data };
        } else {
            console.error('❌ Home Collections Query failed:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ Home Collections Query error:', error);
        return { success: false, error };
    }
}

/**
 * Test the GraphQL endpoint with a simple query
 */
export async function testGraphQL(query?: string) {
    console.log('🧪 Testing GraphQL API...');

    const testQuery = query || `
    query TestQuery {
      products {
        id
        name
      }
    }
  `;

    try {
        const response = await fetch('/api/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: testQuery }),
        });

        const data = await response.json();

        if (response.ok && !data.errors) {
            console.log('✅ GraphQL API working!');
            console.log('📦 Data received:', data);
            return { success: true, data };
        } else {
            console.error('❌ GraphQL API failed:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ GraphQL API error:', error);
        return { success: false, error };
    }
}

/**
 * Run all API tests
 */
export async function testAllAPIs() {
    console.log('🚀 Running all GraphQL API tests...\n');

    const results = {
        collections: await testCollections(),
        banners: await testBanners(),
        homeCollections: await testHomeCollections(),
        products: await testGraphQL(),
    };

    console.log('\n📊 Test Results Summary:');
    console.log('Collections:', results.collections.success ? '✅ PASS' : '❌ FAIL');
    console.log('Banners:', results.banners.success ? '✅ PASS' : '❌ FAIL');
    console.log('Home Collections:', results.homeCollections.success ? '✅ PASS' : '❌ FAIL');
    console.log('Products:', results.products.success ? '✅ PASS' : '❌ FAIL');

    return results;
}

// Browser console usage:
// import { testAllAPIs, testCollections, testBanners } from '@/lib/testing/api-test';
// testAllAPIs();

