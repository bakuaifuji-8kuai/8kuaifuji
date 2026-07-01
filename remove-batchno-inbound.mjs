import fs from 'fs';

const filePath = 'src/pages/Inbound/InboundPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split(/\r?\n/);

const removedLines = [];

// 找到并移除查看弹窗中的批次号表头和数据行
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 查看弹窗 - 表头中的批次号
  if (line.includes('批次号') && line.includes('<th') && line.includes('px-3 py-2')) {
    removedLines.push({ line: i+1, content: line.trim(), type: 'view-th' });
    lines.splice(i, 1);
    i--;
    continue;
  }
  
  // 查看弹窗 - 数据行中的批次号
  if (line.includes('batchNo') && line.includes('<td') && line.includes('px-3 py-2')) {
    removedLines.push({ line: i+1, content: line.trim(), type: 'view-td' });
    lines.splice(i, 1);
    i--;
    continue;
  }
  
  // 编辑弹窗 - 表头中的批次号
  if (line.includes('批次号') && line.includes('<th') && line.includes('px-2 py-2')) {
    removedLines.push({ line: i+1, content: line.trim(), type: 'edit-th' });
    lines.splice(i, 1);
    i--;
    continue;
  }
  
  // 编辑弹窗 - 批次号输入框的整个td
  if (line.includes('batchNo') && line.includes('<td className="px-2 py-2">')) {
    // 找到这个td的结束位置
    // 通常是<td>然后几行然后</td>
    removedLines.push({ line: i+1, content: line.trim(), type: 'edit-td-start' });
    // 找到</td>
    let tdEnd = i;
    while (tdEnd < lines.length && !lines[tdEnd].includes('</td>')) {
      tdEnd++;
    }
    if (tdEnd < lines.length) {
      removedLines.push({ line: tdEnd+1, content: lines[tdEnd].trim(), type: 'edit-td-end' });
    }
    const count = tdEnd - i + 1;
    lines.splice(i, count);
    i--;
    continue;
  }
}

// 调整colSpan
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('colSpan={8')) {
    const match = lines[i].match(/colSpan=\{(\d+)\}/);
    if (match) {
      const current = parseInt(match[1]);
      if (current === 8) {
        lines[i] = lines[i].replace('colSpan={8}', 'colSpan={7}');
        removedLines.push({ line: i+1, content: 'colSpan 8->7', type: 'colspan' });
      } else if (current === 6) {
        lines[i] = lines[i].replace('colSpan={6}', 'colSpan={5}');
        removedLines.push({ line: i+1, content: 'colSpan 6->5', type: 'colspan' });
      }
    }
  }
}

content = lines.join('\r\n');
fs.writeFileSync(filePath, content, 'utf-8');

console.log('Removed lines:');
removedLines.forEach(r => console.log(`  Line ${r.line}: ${r.content.substring(0, 60)} [${r.type}]`));
console.log(`\nTotal removed: ${removedLines.length} items`);
console.log('File saved!');
