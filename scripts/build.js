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
const prismaPath = path.join(__dirname, '..', 'prisma');
const dbPath = path.join(__dirname, '..', 'db');

// Copy .next/static to .next/standalone/.next/static
const destStaticPath = path.join(standalonePath, '.next', 'static');
if (fs.existsSync(staticPath)) {
  fs.mkdirSync(path.dirname(destStaticPath), { recursive: true });
  copyDir(staticPath, destStaticPath);
  console.log('✅ Copied .next/static');
}

// Copy public to .next/standalone/public
const destPublicPath = path.join(standalonePath, 'public');
if (fs.existsSync(publicPath)) {
  copyDir(publicPath, destPublicPath);
  console.log('✅ Copied public');
}

// Copy prisma folder
const destPrismaPath = path.join(standalonePath, 'prisma');
if (fs.existsSync(prismaPath)) {
  copyDir(prismaPath, destPrismaPath);
  console.log('✅ Copied prisma');
}

// Copy db folder if exists
const destDbPath = path.join(standalonePath, 'db');
if (fs.existsSync(dbPath)) {
  copyDir(dbPath, destDbPath);
  console.log('✅ Copied db');
} else {
  fs.mkdirSync(destDbPath, { recursive: true });
  console.log('✅ Created db folder');
}

// Copy .env file if exists
const envPath = path.join(__dirname, '..', '.env');
const destEnvPath = path.join(standalonePath, '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, destEnvPath);
  console.log('✅ Copied .env');
} else {
  // Create default .env
  fs.writeFileSync(destEnvPath, 'DATABASE_URL="file:./db/custom.db"');
  console.log('✅ Created default .env');
}

// Copy package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const destPackagePath = path.join(standalonePath, 'package.json');
if (fs.existsSync(packagePath)) {
  fs.copyFileSync(packagePath, destPackagePath);
  console.log('✅ Copied package.json');
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
