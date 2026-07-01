const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, 'src/pages/Report/Asset');

const detailModalPatterns = [
  '调拨单详情',
  '报损单详情',
  '报废单详情',
  '归还单详情',
  '资产入库单详情',
  '领用单详情',
];

fs.readdirSync(reportDir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  
  const filePath = path.join(reportDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  let newContent = content;
  let changed = false;
  
  detailModalPatterns.forEach(pattern => {
    const regex = new RegExp(`(<Modal\\s+[^>]*title=["']${pattern}["'][^>]*?)\\s+width="[^"]+"`, 'g');
    const matches = newContent.match(regex);
    if (matches) {
      newContent = newContent.replace(regex, '$1');
      console.log(`${file}: Removed width from "${pattern}" modal (${matches.length} occurrences)`);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`File saved: ${file}`);
  }
});

console.log('Done!');