import { gql } from 'graphql-tag';
import fs from 'fs';
import path from 'path';

const schemasDir = path.join(process.cwd(), 'src/lib/graphql/schemas');

const readSchema = (filename: string) => {
  return fs.readFileSync(path.join(schemasDir, filename), 'utf8');
};

const baseSchema = readSchema('base.graphql');
const authSchema = readSchema('auth.graphql');
const productSchema = readSchema('product.graphql');
const assetSchema = readSchema('asset.graphql');
const collectionSchema = readSchema('collection.graphql');
const homepageSchema = readSchema('homepage.graphql');
const blogSchema = readSchema('blog.graphql');
const bannerSchema = readSchema('banner.graphql');
const customerSchema = readSchema('customer.graphql');
const shippingSchema = readSchema('shipping.graphql');
const orderSchema = readSchema('order.graphql');
const analyticsSchema = readSchema('analytics.graphql');
const paymentSchema = readSchema('payment.graphql');

export const typeDefs = gql`
  ${baseSchema}
  ${authSchema}
  ${productSchema}
  ${assetSchema}
  ${collectionSchema}
  ${homepageSchema}
  ${blogSchema}
  ${bannerSchema}
  ${customerSchema}
  ${shippingSchema}
  ${orderSchema}
  ${analyticsSchema}
  ${paymentSchema}
`;
