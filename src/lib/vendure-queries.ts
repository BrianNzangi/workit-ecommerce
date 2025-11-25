import { gql } from '@apollo/client';

// ============================================
// PRODUCT QUERIES
// ============================================

export const GET_PRODUCTS = gql`
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
          source
        }
        variants {
          id
          name
          sku
          price
          priceWithTax
          currencyCode
          stockOnHand
        }
        collections {
          id
          name
          slug
        }
      }
      totalItems
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        preview
        source
      }
      variants {
        id
        name
        sku
        price
        priceWithTax
        currencyCode
        stockOnHand
        options {
          id
          code
          name
        }
      }
      optionGroups {
        id
        code
        name
        options {
          id
          code
          name
        }
      }
      customFields {
        metaTitle
        metaDescription
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      items {
        productId
        productName
        slug
        description
        productAsset {
          id
          preview
        }
        price {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
      }
      totalItems
    }
  }
`;

// ============================================
// COLLECTION QUERIES
// ============================================

export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      items {
        id
        name
        slug
        description
        featuredAsset {
          preview
        }
        parent {
          id
          name
        }
        children {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_SLUG = gql`
  query GetCollectionBySlug($slug: String!, $options: ProductListOptions) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        preview
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
      }
      productVariants(options: $options) {
        items {
          id
          name
          sku
          price
          priceWithTax
          currencyCode
          product {
            id
            name
            slug
            featuredAsset {
              preview
            }
          }
        }
        totalItems
      }
    }
  }
`;

// ============================================
// CART/ORDER QUERIES
// ============================================

export const GET_ACTIVE_ORDER = gql`
  query GetActiveOrder {
    activeOrder {
      id
      code
      state
      totalQuantity
      subTotal
      subTotalWithTax
      shipping
      shippingWithTax
      total
      totalWithTax
      currencyCode
      lines {
        id
        productVariant {
          id
          name
          sku
          price
          priceWithTax
          product {
            name
            slug
            featuredAsset {
              preview
            }
          }
        }
        quantity
        linePrice
        linePriceWithTax
      }
      shippingAddress {
        fullName
        streetLine1
        city
        postalCode
        country
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ... on Order {
        id
        code
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
          linePrice
          productVariant {
            id
            name
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const ADJUST_ORDER_LINE = gql`
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ... on Order {
        id
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
          linePrice
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const REMOVE_ORDER_LINE = gql`
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ... on Order {
        id
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// ============================================
// CUSTOMER AUTHENTICATION
// ============================================

export const REGISTER_CUSTOMER = gql`
  mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const GET_ACTIVE_CUSTOMER = gql`
  query GetActiveCustomer {
    activeCustomer {
      id
      firstName
      lastName
      emailAddress
      phoneNumber
      addresses {
        id
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          code
          name
        }
        defaultShippingAddress
        defaultBillingAddress
      }
    }
  }
`;

// ============================================
// CHECKOUT FLOW
// ============================================

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order {
        id
        shippingAddress {
          fullName
          streetLine1
          city
          postalCode
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      price
      priceWithTax
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        id
        shipping
        shippingWithTax
        totalWithTax
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const ADD_PAYMENT = gql`
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        id
        code
        state
        totalWithTax
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

export const GET_ORDER_BY_CODE = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      id
      code
      state
      totalWithTax
      currencyCode
      lines {
        id
        productVariant {
          name
          product {
            name
          }
        }
        quantity
        linePriceWithTax
      }
      shippingAddress {
        fullName
        streetLine1
        city
      }
    }
  }
`;

// ============================================
// CUSTOMER ORDERS
// ============================================

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($options: OrderListOptions) {
    activeCustomer {
      id
      orders(options: $options) {
        items {
          id
          code
          state
          totalWithTax
          currencyCode
          createdAt
          lines {
            id
            productVariant {
              name
              product {
                name
                featuredAsset {
                  preview
                }
              }
            }
            quantity
          }
        }
        totalItems
      }
    }
  }
`;
