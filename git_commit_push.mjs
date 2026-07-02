import { execSync } from 'child_process';

const gitPath = 'D:\\Git\\bin\\git.exe';

function git(args) {
  const cmd = `"${gitPath}" ${args}`;
  console.log(`> git ${args}`);
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      cwd: 'd:\\会展仓库项目',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(result);
    return result;
  } catch (e) {
    console.error('Error:', e.stderr || e.message);
    throw e;
  }
}

try {
  git('add .');
  git('commit -m "feat: 新增展会物资调拨出库/入库、库存查询优化、采购订单硬编码等"');
  git('push origin main');
  console.log('\n=== 提交并推送成功！GitHub Actions 将自动部署 ===');
} catch (e) {
  console.log('\n=== 推送可能遇到网络问题，请检查 ===');
}
