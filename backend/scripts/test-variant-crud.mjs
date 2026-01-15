#!/usr/bin/env node

/**
 * Test script for Product Variant CRUD operations
 * This script tests the variant management functionality through GraphQL
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

// Test admin credentials
const TEST_ADMIN = {
  email: 'admin@workit.test',
  password: 'SecurePassword123!',
  firstName: 'Test',
  lastName: 'Admin',
};

async function main() {
  console.log('🚀 Starting Product Variant CRUD Test\n');

  try {
    // Step 1: Register or login admin
    console.log('1️⃣  Authenticating admin user...');
    let token;
    
    try {
      const registerData = await graphqlRequest(
        `mutation Register($input: RegisterAdminInput!) {
          register(input: $input) {
            token
            user {
              id
              email
              firstName
              lastName
            }
          }
        }`,
        { input: TEST_ADMIN }
      );
      token = registerData.register.token;
      console.log('✅ Admin registered successfully');
    } catch (error) {
      // If registration fails, try login
      const loginData = await graphqlRequest(
        `mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
            }
          }
        }`,
        { 
          input: { 
            email: TEST_ADMIN.email, 
            password: TEST_ADMIN.password 
          } 
        }
      );
      token = loginData.login.token;
      console.log('✅ Admin logged in successfully');
    }

    // Step 2: Create a product
    console.log('\n2️⃣  Creating a test product...');
    const productData = await graphqlRequest(
      `mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id
          name
          slug
          enabled
        }
      }`,
      {
        input: {
          name: 'Test Laptop for Variants',
          description: 'A test laptop with multiple variants',
          enabled: true,
        },
      },
      token
    );
    const product = productData.createProduct;
    console.log('✅ Product created:', product.name, `(ID: ${product.id})`);

    // Step 3: Add first variant
    console.log('\n3️⃣  Adding first variant (16GB RAM)...');
    const variant1Data = await graphqlRequest(
      `mutation AddVariant($input: CreateVariantInput!) {
        addVariantToProduct(input: $input) {
          id
          name
          sku
          price
          stockOnHand
          enabled
        }
      }`,
      {
        input: {
          productId: product.id,
          name: 'Laptop - 16GB RAM',
          sku: 'LAPTOP-16GB-001',
          price: 89999, // 899.99 KES in cents
          stockOnHand: 50,
          enabled: true,
        },
      },
      token
    );
    const variant1 = variant1Data.addVariantToProduct;
    console.log('✅ Variant 1 created:', variant1.name, `(SKU: ${variant1.sku})`);
    console.log('   Price: KES', (variant1.price / 100).toFixed(2));
    console.log('   Stock:', variant1.stockOnHand);

    // Step 4: Add second variant
    console.log('\n4️⃣  Adding second variant (32GB RAM)...');
    const variant2Data = await graphqlRequest(
      `mutation AddVariant($input: CreateVariantInput!) {
        addVariantToProduct(input: $input) {
          id
          name
          sku
          price
          stockOnHand
          enabled
        }
      }`,
      {
        input: {
          productId: product.id,
          name: 'Laptop - 32GB RAM',
          sku: 'LAPTOP-32GB-001',
          price: 119999, // 1199.99 KES in cents
          stockOnHand: 30,
          enabled: true,
        },
      },
      token
    );
    const variant2 = variant2Data.addVariantToProduct;
    console.log('✅ Variant 2 created:', variant2.name, `(SKU: ${variant2.sku})`);
    console.log('   Price: KES', (variant2.price / 100).toFixed(2));
    console.log('   Stock:', variant2.stockOnHand);

    // Step 5: Update variant stock
    console.log('\n5️⃣  Updating variant 1 stock quantity...');
    const updatedStockData = await graphqlRequest(
      `mutation UpdateStock($id: ID!, $stockOnHand: Int!) {
        updateVariantStock(id: $id, stockOnHand: $stockOnHand) {
          id
          name
          stockOnHand
        }
      }`,
      {
        id: variant1.id,
        stockOnHand: 25,
      },
      token
    );
    const updatedVariant = updatedStockData.updateVariantStock;
    console.log('✅ Stock updated:', updatedVariant.name);
    console.log('   New stock:', updatedVariant.stockOnHand);

    // Step 6: Update variant details
    console.log('\n6️⃣  Updating variant 2 details...');
    const updatedVariantData = await graphqlRequest(
      `mutation UpdateVariant($id: ID!, $input: UpdateVariantInput!) {
        updateVariant(id: $id, input: $input) {
          id
          name
          sku
          price
          stockOnHand
          enabled
        }
      }`,
      {
        id: variant2.id,
        input: {
          price: 109999, // Reduced price
          stockOnHand: 35, // Increased stock
        },
      },
      token
    );
    const updatedVariant2 = updatedVariantData.updateVariant;
    console.log('✅ Variant updated:', updatedVariant2.name);
    console.log('   New price: KES', (updatedVariant2.price / 100).toFixed(2));
    console.log('   New stock:', updatedVariant2.stockOnHand);

    // Step 7: Query product with variants
    console.log('\n7️⃣  Querying product with all variants...');
    const productWithVariantsData = await graphqlRequest(
      `query GetProduct($id: ID!) {
        product(id: $id) {
          id
          name
          slug
          variants {
            id
            name
            sku
            price
            stockOnHand
            enabled
          }
        }
      }`,
      { id: product.id },
      token
    );
    const productWithVariants = productWithVariantsData.product;
    console.log('✅ Product retrieved with variants:');
    console.log('   Product:', productWithVariants.name);
    console.log('   Variants:', productWithVariants.variants.length);
    productWithVariants.variants.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name} - ${v.sku} - KES ${(v.price / 100).toFixed(2)} - Stock: ${v.stockOnHand}`);
    });

    // Step 8: Clean up
    console.log('\n8️⃣  Cleaning up test data...');
    await graphqlRequest(
      `mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
      }`,
      { id: product.id },
      token
    );
    console.log('✅ Test product deleted');

    console.log('\n✨ All variant CRUD operations completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
