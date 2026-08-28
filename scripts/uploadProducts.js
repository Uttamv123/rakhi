/**
 * Upload products from products.json to AWS DynamoDB.
 *
 * Usage: node scripts/uploadProducts.js
 *
 * Requires:
 *   - @aws-sdk/client-dynamodb
 *   - @aws-sdk/lib-dynamodb
 *   - dotenv
 *   - A "products.json" file in the project root
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(process.cwd(), '.env') });

// Validate required env vars
const REQUIRED_ENV = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'DYNAMODB_TABLE'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const REGION = process.env.AWS_REGION;

const client = new DynamoDBClient({
  region: REGION,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  }),
});

const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');

/**
 * Check if a product already exists in DynamoDB by productId.
 */
async function productExists(productId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId },
    }));
    return !!result.Item;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      return false;
    }
    throw err;
  }
}

/**
 * Insert a product into DynamoDB.
 */
async function insertProduct(product) {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: product,
  }));
}

/**
 * Main upload routine.
 */
async function main() {
  console.log(`\n📂 Reading products from: ${PRODUCTS_FILE}`);

  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.error(`❌ products.json not found at: ${PRODUCTS_FILE}`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

  if (!Array.isArray(products) || products.length === 0) {
    console.log('⚠️  No products found in products.json');
    return;
  }

  console.log(`✅ Found ${products.length} product(s) to process.`);
  console.log(`☁️  Table: ${TABLE_NAME} | Region: ${REGION}\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const { productId, name } = product;

    try {
      await insertProduct(product);
      console.log(`✅ Uploaded: ${productId} — ${name}`);
      uploaded++;
    } catch (err) {
      console.error(`❌ Failed: ${productId} — ${name} — ${err.name}: ${err.message}`);
      if (err.$metadata) {
        console.error(`   HTTP ${err.$metadata.httpStatusCode} | Request ID: ${err.$metadata.requestId}`);
      }
      failed++;
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`📊 Summary:`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Failed:   ${failed}`);
  console.log(`   Total:    ${products.length}`);
  console.log('─────────────────────────────────────\n');
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err.message);
  process.exit(1);
});
