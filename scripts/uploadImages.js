/**
 * Upload product images from Rakhi-Assets folder to AWS S3.
 *
 * Usage: node scripts/uploadImages.js
 *
 * Requires:
 *   - @aws-sdk/client-s3
 *   - dotenv
 *   - A "Rakhi-Assets" folder in the project root with product sub-folders
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
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
const REQUIRED_ENV = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

const s3 = new S3Client({
  region: REGION,
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  }),
});

const SUPPORTED_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const ASSETS_DIR = path.join(process.cwd(), 'Rakhi-Assets');

/**
 * Recursively collect all image files from a directory.
 */
function getImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getImageFiles(fullPath, fileList);
    } else if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Check if an object already exists in S3.
 */
async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}

/**
 * Get the MIME type based on file extension.
 */
function getMimeType(ext) {
  const mimeMap = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Main upload routine.
 */
async function main() {
  console.log(`\n📂 Looking for images in: ${ASSETS_DIR}`);

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Rakhi-Assets folder not found at: ${ASSETS_DIR}`);
    console.error('   Make sure the "Rakhi-Assets" folder exists in the project root.');
    process.exit(1);
  }

  const imageFiles = getImageFiles(ASSETS_DIR);

  if (imageFiles.length === 0) {
    console.log('⚠️  No supported image files found (.webp, .png, .jpg, .jpeg)');
    return;
  }

  console.log(`✅ Found ${imageFiles.length} image(s) to process.`);
  console.log(`☁️  Bucket: ${BUCKET} | Region: ${REGION}\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of imageFiles) {
    // Build the S3 key: products/<folder>/<filename>
    const relativePath = path.relative(ASSETS_DIR, filePath);
    const s3Key = `products/${relativePath.replace(/\\/g, '/')}`;

    try {
      // Skip if already exists

      // Read file and upload
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: getMimeType(ext),
      }));

      console.log(`✅ Uploaded: ${s3Key}`);
      uploaded++;
    } catch (err) {
      console.error(`❌ Failed: ${s3Key} — ${err.name}: ${err.message}`);
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
  console.log(`   Total:    ${imageFiles.length}`);
  console.log('─────────────────────────────────────\n');
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err.message);
  process.exit(1);
});
