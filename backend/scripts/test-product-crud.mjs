#!/usr/bin/env node

/**
 * Test script for Product CRUD operations via GraphQL
 * This script tests the createProduct, updateProduct, getProduct, and deleteProduct operations
 */

import 'dotenv/config';

const GRAPHQL_ENDPOINT = 'http://localhost:3000/api/graphql';

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error('GraphQL request failed');
  }

  return result.data;
}

// Test login to get auth token
async function login() {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user {
          id
          email
          firstName
          lastName
        }
      }
    }
  `;

  const variables = {
    input: {
      email: 'admin@workit.com',
      password: 'admin123456',
    },
  };

  try {
    const data = await graphqlRequest(query, variables);
    console.log('✅ Login successful');
    console.log('User:', data.login.user);
    return data.login.token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Test create product
async function testCreateProduct(token) {
  const query = `
    mutation CreateProduct($input: CreateProductInput!) {
      createProduct(input: $input) {
        id
        name
        slug
        description
        enabled
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const variables = {
    input: {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product created via GraphQL',
      enabled: true,
    },
  };

  try {
    const data = await graphqlRequest(query, variables, token);
    console.log('\n✅ Product created successfully');
    console.log('Product:', data.createProduct);
    return data.createProduct;
  } catch (error) {
    console.error('❌ Create product failed:', error.message);
    throw error;
  }
}

// Test get product
async function testGetProduct(token, productId) {
  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        name
        slug
        description
        enabled
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const variables = { id: productId };

  try {
    const data = await graphqlRequest(query, variables, token);
    console.log('\n✅ Product retrieved successfully');
    console.log('Product:', data.product);
    return data.product;
  } catch (error) {
    console.error('❌ Get product failed:', error.message);
    throw error;
  }
}

// Test update product
async function testUpdateProduct(token, productId) {
  const query = `
    mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
      updateProduct(id: $id, input: $input) {
        id
        name
        slug
        description
        enabled
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const variables = {
    id: productId,
    input: {
      name: 'Updated Test Product',
      description: 'This product has been updated',
      enabled: false,
    },
  };

  try {
    const data = await graphqlRequest(query, variables, token);
    console.log('\n✅ Product updated successfully');
    console.log('Product:', data.updateProduct);
    return data.updateProduct;
  } catch (error) {
    console.error('❌ Update product failed:', error.message);
    throw error;
  }
}

// Test delete product (soft delete)
async function testDeleteProduct(token, productId) {
  const query = `
    mutation DeleteProduct($id: ID!) {
      deleteProduct(id: $id)
    }
  `;

  const variables = { id: productId };

  try {
    const data = await graphqlRequest(query, variables, token);
    console.log('\n✅ Product deleted successfully');
    console.log('Result:', data.deleteProduct);
    return data.deleteProduct;
  } catch (error) {
    console.error('❌ Delete product failed:', error.message);
    throw error;
  }
}

// Test get deleted product (should return null without includeDeleted)
async function testGetDeletedProduct(token, productId) {
  const query = `
    query GetProduct($id: ID!, $includeDeleted: Boolean) {
      product(id: $id, includeDeleted: $includeDeleted) {
        id
        name
        deletedAt
      }
    }
  `;

  try {
    // Without includeDeleted flag
    const data1 = await graphqlRequest(query, { id: productId, includeDeleted: false }, token);
    console.log('\n✅ Get deleted product (customer view):', data1.product);

    // With includeDeleted flag
    const data2 = await graphqlRequest(query, { id: productId, includeDeleted: true }, token);
    console.log('✅ Get deleted product (admin view):', data2.product);
  } catch (error) {
    console.error('❌ Get deleted product failed:', error.message);
    throw error;
  }
}

// Test list products
async function testListProducts(token) {
  const query = `
    query GetProducts($options: ProductListOptions) {
      products(options: $options) {
        id
        name
        slug
        enabled
        deletedAt
      }
    }
  `;

  const variables = {
    options: {
      take: 10,
      skip: 0,
      includeDeleted: false,
    },
  };

  try {
    const data = await graphqlRequest(query, variables, token);
    console.log('\n✅ Products listed successfully');
    console.log('Count:', data.products.length);
    console.log('Products:', data.products);
  } catch (error) {
    console.error('❌ List products failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Product CRUD Tests\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Login
    const token = await login();

    // Step 2: Create product
    const product = await testCreateProduct(token);

    // Step 3: Get product
    await testGetProduct(token, product.id);

    // Step 4: Update product
    await testUpdateProduct(token, product.id);

    // Step 5: List products
    await testListProducts(token);

    // Step 6: Delete product
    await testDeleteProduct(token, product.id);

    // Step 7: Verify soft delete
    await testGetDeletedProduct(token, product.id);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!');
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
