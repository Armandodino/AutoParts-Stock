const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Next.js application...');

// Run Next.js build
execSync('next build', { stdio: 'inherit' });

console.log('📂 Organizing files...');

const standalonePath = path.join(__dirname, '..', '.next', 'standalone');

// Find the actual server.js location (Next.js creates nested folders)
function findServerJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'server.js' && entry.isFile()) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const found = findServerJs(fullPath);
      if (found) return found;
    }
  }
  return null;
}

// Find where the actual standalone files are
function findStandaloneRoot(dir) {
  const serverPath = path.join(dir, 'server.js');
  if (fs.existsSync(serverPath)) {
    return dir;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findStandaloneRoot(path.join(dir, entry.name));
      if (found) return found;
    }
  }
  return null;
}

const actualStandalonePath = findStandaloneRoot(standalonePath);
console.log('Found standalone at:', actualStandalonePath);

if (!actualStandalonePath) {
  console.error('❌ Could not find standalone server!');
  process.exit(1);
}

// Copy static files to the correct location
const staticPath = path.join(__dirname, '..', '.next', 'static');
const destStaticPath = path.join(actualStandalonePath, '.next', 'static');
if (fs.existsSync(staticPath)) {
  fs.mkdirSync(path.dirname(destStaticPath), { recursive: true });
  copyDir(staticPath, destStaticPath);
  console.log('✅ Copied .next/static');
}

// Copy public folder
const publicPath = path.join(__dirname, '..', 'public');
const destPublicPath = path.join(actualStandalonePath, 'public');
if (fs.existsSync(publicPath)) {
  copyDir(publicPath, destPublicPath);
  console.log('✅ Copied public');
}

// Copy prisma folder
const prismaPath = path.join(__dirname, '..', 'prisma');
const destPrismaPath = path.join(actualStandalonePath, 'prisma');
if (fs.existsSync(prismaPath)) {
  copyDir(prismaPath, destPrismaPath);
  console.log('✅ Copied prisma');
}

// Copy db folder
const dbPath = path.join(__dirname, '..', 'db');
const destDbPath = path.join(actualStandalonePath, 'db');
if (fs.existsSync(dbPath)) {
  copyDir(dbPath, destDbPath);
  console.log('✅ Copied db');
} else {
  fs.mkdirSync(destDbPath, { recursive: true });
}

// Create .env file
const envPath = path.join(__dirname, '..', '.env');
const destEnvPath = path.join(actualStandalonePath, '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, destEnvPath);
} else {
  fs.writeFileSync(destEnvPath, 'DATABASE_URL="file:./db/custom.db"');
}
console.log('✅ Created .env');

console.log('🎉 Build completed successfully!');
console.log('');
console.log('📁 Server location:', actualStandalonePath);
console.log('🚀 Run: node ' + path.relative(path.join(__dirname, '..'), path.join(actualStandalonePath, 'server.js')));

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
