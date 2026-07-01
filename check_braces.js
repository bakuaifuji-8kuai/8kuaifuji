const fs = require('fs');
const content = fs.readFileSync('d:/会展仓库项目/src/pages/Procurement/ProcurementDemandPage.tsx', 'utf8');
const lines = content.split('\n');
let balance = 0;
let inString = false;
let stringChar = '';

for(let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for(let j = 0; j < line.length; j++) {
    const c = line[j];
    const prev = j > 0 ? line[j-1] : '';
    
    // Skip escaped characters
    if(prev === '\\') continue;
    
    // Handle strings
    if(c === '"' || c === "'" || c === '`') {
      if(!inString) {
        inString = true;
        stringChar = c;
      } else if(c === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }
    
    // Skip if in string
    if(inString) continue;
    
    // Count braces
    if(c === '{') balance++;
    if(c === '}') balance--;
    
    // Track line number where balance goes negative
    if(balance < 0) {
      console.log('Balance goes negative at line', i+1, 'char', j+1, 'value:', balance);
      console.log('Line:', line);
      process.exit(1);
    }
  }
}
console.log('Final balance:', balance);
if(balance !== 0) {
  console.log('WARNING: Unbalanced braces!');
}