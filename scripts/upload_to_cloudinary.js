#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Prefer .env.local (Next.js) but fall back to .env for the script
const projectRoot = path.join(__dirname, '..');
const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = fs.existsSync(envLocalPath) ? envLocalPath : path.join(projectRoot, '.env');
dotenv.config({ path: envPath });

// Accept either server-side env names or NEXT_PUBLIC_* names (for convenience)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY / NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (server-side) or NEXT_PUBLIC_CLOUDINARY_API_SECRET.');
  console.error('Note: keep API secret server-side when possible (use CLOUDINARY_API_SECRET).');
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const mockDataPath = path.join(__dirname, '..', 'src', '_redux', 'mockData.ts');

if (!fs.existsSync(imagesDir)) {
  console.error('Images directory not found:', imagesDir);
  process.exit(1);
}

if (!fs.existsSync(mockDataPath)) {
  console.error('mockData.ts not found at:', mockDataPath);
  process.exit(1);
}

const files = fs.readdirSync(imagesDir).filter(f => /\.(png|jpe?g|webp|gif|avif)$/i.test(f));
if (!files.length) {
  console.log('No image files found in', imagesDir);
  process.exit(0);
}

console.log(`Found ${files.length} images. Uploading to Cloudinary...`);

const uploadPromises = files.map(file => {
  const filePath = path.join(imagesDir, file);
  const publicId = `green_pastures/${path.parse(file).name}`;
  return cloudinary.uploader.upload(filePath, { public_id: publicId, overwrite: true, resource_type: 'image' })
    .then(res => ({ file, url: res.secure_url, public_id: res.public_id, version: res.version }))
    .catch(err => ({ file, error: err }));
});

Promise.all(uploadPromises).then(results => {
  const mapping = {};
  results.forEach(r => {
    if (r.error) console.error('Failed to upload', r.file, r.error);
    else mapping[r.file] = r.url;
  });

  const backupPath = mockDataPath + '.bak';
  fs.copyFileSync(mockDataPath, backupPath);
  let content = fs.readFileSync(mockDataPath, 'utf8');

  Object.keys(mapping).forEach(file => {
    const original = `/images/${file}`;
    const url = mapping[file];
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    content = content.replace(regex, url);
  });

  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log('Updated mockData.ts and backed up original to', backupPath);
  console.log('Uploaded files:', Object.keys(mapping).length);
}).catch(err => { console.error(err); process.exit(1); });
