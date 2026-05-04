const fs = require('fs');
const path = require('path');

// Base directory for downloads
const baseDir = path.join(__dirname, '..', 'public', 'downloads');
const folders = [
  { dir: 'forms', category: 'แบบฟอร์มเอกสาร (Forms)' },
  { dir: 'regulations', category: 'ระเบียบและกฎหมาย (Regulations)' }
];

try {
  const manifest = folders.map(f => {
    const fullPath = path.join(baseDir, f.dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    const files = fs.readdirSync(fullPath)
      .filter(file => !file.startsWith('.')) // Ignore hidden files
      .map(file => ({
        name: file,
        url: `/downloads/${f.dir}/${file}`,
        type: path.extname(file).toUpperCase().replace('.', '') || 'FILE'
      }));
      
    return {
      category: f.category,
      files: files
    };
  });

  fs.writeFileSync(
    path.join(baseDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('--------------------------------------------------');
  console.log('✅ Download manifest generated successfully!');
  console.log('📁 Path: public/downloads/manifest.json');
  console.log('--------------------------------------------------');
} catch (err) {
  console.error('❌ Error generating manifest:', err);
}
