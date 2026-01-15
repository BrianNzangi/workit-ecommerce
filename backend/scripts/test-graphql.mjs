/**
 * Simple script to test the GraphQL endpoint
 * Run with: node scripts/test-graphql.mjs
 * 
 * Make sure the dev server is running first: npm run dev
 */

const GRAPHQL_URL = 'http://localhost:3001/api/graphql';

async function testHealthCheck() {
  console.log('Testing health check query...');
  
  const query = `
    query {
      _health
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('✅ Health check response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testPingMutation() {
  console.log('\nTesting ping mutation...');
  
  const mutation = `
    mutation {
      _ping
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    console.log('✅ Ping mutation response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Ping mutation failed:', error.message);
  }
}

async function testInvalidQuery() {
  console.log('\nTesting invalid query (error handling)...');
  
  const query = `
    query {
      nonExistentField
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('✅ Error response structure:', JSON.stringify(data, null, 2));
    
    if (data.errors && data.errors[0]) {
      console.log('✅ Error has message:', data.errors[0].message);
      console.log('✅ Error has extensions:', data.errors[0].extensions ? 'Yes' : 'No');
    }
  } catch (error) {
    console.error('❌ Invalid query test failed:', error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('GraphQL Endpoint Tests');
  console.log('='.repeat(60));
  console.log(`Endpoint: ${GRAPHQL_URL}`);
  console.log('Make sure the dev server is running: npm run dev\n');

  await testHealthCheck();
  await testPingMutation();
  await testInvalidQuery();

  console.log('\n' + '='.repeat(60));
  console.log('Tests completed!');
  console.log('='.repeat(60));
}

runTests();
