/* eslint-disable */
// 腾讯云 COS 批量部署脚本
// 用法: node cos-deploy.cjs
// 规则：index.html 带 Cache-Control: no-cache + Content-Disposition: inline
//       其他文件（js/css/svg/html/favicon等）保持默认上传配置

const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

// ============== ⚠️ 密钥在这里填 ⚠️ ==============
// 腾讯云控制台 → 访问管理 → API 密钥管理 里获取
const SECRET_ID = process.env.COS_SECRET_ID || '请在这里填你的 SecretId';
const SECRET_KEY = process.env.COS_SECRET_KEY || '请在这里填你的 SecretKey';
const BUCKET = 'bkfj-1306169712';
const REGION = 'ap-guangzhou';
const LOCAL_DIR = path.join(__dirname, 'dist');

const cos = new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY });

// 递归收集所有文件
function collectFiles(dir, baseDir = dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(full, baseDir));
    } else if (entry.isFile()) {
      result.push(full);
    }
  }
  return result;
}

// 先验证密钥是否有效
function testKey() {
  return new Promise((resolve, reject) => {
    cos.getBucket({ Bucket: BUCKET, Region: REGION, MaxKeys: 1 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function uploadAll() {
  // 先测密钥
  try {
    await testKey();
  } catch (err) {
    console.error('❌ COS 密钥无效:', err.Message || err.message);
    console.error('   请到腾讯云控制台 → 访问管理 → API 密钥管理 重新生成 AccessKey');
    process.exit(1);
  }

  const files = collectFiles(LOCAL_DIR);
  console.log(`📦 共 ${files.length} 个文件待上传\n`);

  let success = 0;
  let fail = 0;
  const BATCH = 10;

  async function worker() {
    while (true) {
      const idx = global.idx = (global.idx || 0);
      if (idx >= files.length) break;
      global.idx = idx + 1;

      const localPath = files[idx];
      const relative = path.relative(LOCAL_DIR, localPath).replace(/\\/g, '/');
      const cosKey = relative.toLowerCase() === 'index.html' ? 'index.html' : relative;

      const params = { Bucket: BUCKET, Region: REGION, Key: cosKey, FilePath: localPath };
      if (cosKey === 'index.html') {
        params.Headers = {
          'Cache-Control': 'no-cache',
          'Content-Disposition': 'inline',
        };
      }

      try {
        await new Promise((resolve, reject) => {
          cos.uploadFile(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        success++;
        if (cosKey === 'index.html') {
          console.log(`✅ [index.html] 带 Cache-Control: no-cache + Content-Disposition: inline`);
        }
      } catch (err) {
        fail++;
        console.error(`❌ ${cosKey}: ${err.message}`);
      }
      process.stdout.write(`\r   进度: ${success + fail}/${files.length}  成功:${success}  失败:${fail}`);
    }
  }

  const workers = [];
  for (let i = 0; i < BATCH; i++) workers.push(worker());
  await Promise.all(workers);

  console.log(`\n\n🎉 完成！成功: ${success} / 失败: ${fail}`);
  if (fail > 0) process.exit(1);
}

uploadAll().catch(console.error);
