const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Next.js application...');

// Run Next.js build
execSync('next build', { stdio: 'inherit' });

console.log('📂 Copying static files...');

// Define paths
const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
const staticPath = path.join(__dirname, '..', '.next', 'static');
const publicPath = path.join(__dirname, '..', 'public');

// Copy .next/static to .next/standalone/.next/static
const destStaticPath = path.join(standalonePath, '.next', 'static');
if (fs.existsSync(staticPath)) {
  fs.mkdirSync(path.dirname(destStaticPath), { recursive: true });
  copyDir(staticPath, destStaticPath);
  console.log('✅ Copied .next/static to .next/standalone/.next/static');
}

// Copy public to .next/standalone/public
const destPublicPath = path.join(standalonePath, 'public');
if (fs.existsSync(publicPath)) {
  copyDir(publicPath, destPublicPath);
  console.log('✅ Copied public to .next/standalone/public');
}

console.log('🎉 Build completed successfully!');

// Helper function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
