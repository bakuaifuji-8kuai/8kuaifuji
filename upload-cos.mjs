// 上传 dist 目录到腾讯云 COS（公共读公共写模式，无需签名）
import fs from 'fs'
import path from 'path'

const Bucket = 'bkfj-1306169712'
const Region = 'ap-guangzhou'

const DIST_DIR = path.resolve('dist')
if (!fs.existsSync(DIST_DIR)) {
  console.error('dist 目录不存在，请先执行 npm run build')
  process.exit(1)
}

// 上传单个文件（公共读写模式，无需 Authorization）
async function upload(filePath, key) {
  const url = `https://${Bucket}.cos.${Region}.myqcloud.com${key}`
  const fileContent = fs.readFileSync(filePath)

  const ext = path.extname(filePath).toLowerCase()
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.map': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  }
  const contentType = contentTypes[ext] || 'application/octet-stream'

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: fileContent,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`)
  }
  return key
}

// 遍历 dist 目录
function walk(dir, base = '') {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.join(base, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      results.push(...walk(fullPath, relPath))
    } else {
      results.push({ fullPath, relPath })
    }
  }
  return results
}

const files = walk(DIST_DIR)
console.log(`共 ${files.length} 个文件待上传\n`)

let success = 0
let fail = 0

for (const file of files) {
  try {
    await upload(file.fullPath, '/' + file.relPath)
    success++
    process.stdout.write(`\r✔ ${success}/${files.length}: ${file.relPath}`)
  } catch (e) {
    fail++
    process.stdout.write(`\n✘ ${file.relPath}: ${e.message}`)
  }
}

console.log(`\n\n上传完成: 成功 ${success}, 失败 ${fail}`)
if (fail === 0) {
  console.log(`\n🎉 部署成功！访问地址: https://${Bucket}.cos-website.${Region}.myqcloud.com`)
} else {
  process.exit(1)
}
