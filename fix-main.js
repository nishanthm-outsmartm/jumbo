// fix-main.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make sure client/dist exists
const clientDistDir = path.resolve(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDistDir)) {
  fs.mkdirSync(clientDistDir, { recursive: true });
}

// Create a symlink from client/dist/src to client/src
const srcDir = path.resolve(__dirname, 'client', 'src');
const srcLinkPath = path.resolve(clientDistDir, 'src');

try {
  // Remove existing link if it exists
  if (fs.existsSync(srcLinkPath)) {
    fs.unlinkSync(srcLinkPath);
  }
  
  // Create the symlink
  fs.symlinkSync(srcDir, srcLinkPath, 'junction');
  console.log('Successfully created symlink from client/dist/src to client/src');
} catch (error) {
  console.error('Failed to create symlink:', error);
}

console.log('Fix completed. Please restart your server.');
