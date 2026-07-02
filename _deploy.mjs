import { execSync } from 'child_process';

const gitPath = 'D:\\Git\\bin\\git.exe';

function git(args) {
  const cmd = `"${gitPath}" ${args}`;
  console.log(`> git ${args}`);
  const result = execSync(cmd, {
    encoding: 'utf8',
    cwd: 'd:\\会展仓库项目',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(result);
  return result;
}

try {
  git('add .');
  git('commit -m "fix: 修复TypeScript构建错误 - 导入类型、confirmTime字段、SearchField组件用法"');
  git('push origin main');
  console.log('\n=== 提交并推送成功！GitHub Actions 将自动部署 ===');
} catch (e) {
  console.error('Error:', e.stderr || e.message);
}
