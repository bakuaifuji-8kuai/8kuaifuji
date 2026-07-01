const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'mock', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf-8');

const specMap = {
  'QD2001': '6㎡（单线63A头/15米长）',
  'QD2002': '6㎡（单线125A头/15米长）',
  'QD2003': '4㎡（单线32A头/15米长）',
  'QD2004': '16㎡（无头/15米长）',
  'QD2005': '4㎡3芯/16A/10米（16A电箱）',
  'QD2006': '4㎡3芯（无头/20米长）',
  'QD2007': '25㎡（无头带铜鼻子/20米长）',
  'QD2008': '16㎡（无头带铜鼻子/20米长）',
  'QD2009': '4㎡（无头/85米长）（3芯）',
  'QD2010': '16A',
  'QD2011': '32A',
  'QD2012': '63A',
  'QD2013': '40A',
  'QD2014': '16A/220V',
  'QD2015': '100A',
  'QD2016': '1T/12米',
  'QD2017': '2T/2米',
  'QD2018': '2T/4米',
  'QD2019': '2T/8米',
};

let count = 0;
for (const [code, spec] of Object.entries(specMap)) {
  const regex = new RegExp(`(productCode: '${code}',\\s*\\n\\s*productName: '[^']+',\\s*\\n\\s*)(unit: ')`, 'g');
  const newContent = content.replace(regex, `$1specification: '${spec}',\n        $2`);
  if (newContent !== content) {
    const matches = content.match(regex);
    if (matches) count += matches.length;
    content = newContent;
  }
}

console.log(`Updated ${count} items with specification field`);
fs.writeFileSync(dataPath, content, 'utf-8');
console.log('Done!');
