// Debug script to check build output
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build output...');

const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder does not exist!');
  process.exit(1);
}

const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist in dist folder!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
console.log('✅ index.html exists');
console.log('📄 index.html content preview:');
console.log(indexContent.substring(0, 500) + '...');

const files = fs.readdirSync(distPath);
console.log('📁 Files in dist folder:');
files.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  console.log(`  ${file} (${stats.isDirectory() ? 'dir' : 'file'})`);
});

console.log('✅ Build output looks good!');
