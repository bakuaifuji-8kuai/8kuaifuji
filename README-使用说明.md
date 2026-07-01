# 仓库管理系统 - 使用说明

## 一、项目简介

这是一个基于 React + TypeScript + Vite 开发的仓库管理系统，包含以下功能模块：

- **库存管理**：库存查询（汇总/批次）、盘点管理、库存流水记录
- **入库管理**：采购入库、退货入库
- **出库管理**：领用出库、归还退库、报废出库、报损出库
- **基础资料**：仓库管理、仓位管理、物资分类、供应商管理
- **报表管理**：库存报表、入库汇总、出库汇总、库龄分析、呆滞分析

## 二、环境要求

请确保您的电脑已安装以下软件：

| 软件 | 版本要求 | 下载地址 |
|------|---------|---------|
| Node.js | 18.x 或更高版本 | https://nodejs.org |
| npm | 随 Node.js 自动安装 | - |

**验证安装：**
打开命令行（CMD 或 PowerShell），输入：
```
node -v
npm -v
```
能看到版本号即表示安装成功。

## 三、运行步骤

### 步骤1：解压项目
将收到的项目文件夹解压到任意目录，例如：`D:\warehouse-management`

### 步骤2：安装依赖
打开命令行，进入项目目录：
```
cd D:\warehouse-management
npm install
```
等待安装完成（约1-3分钟）。

### 步骤3：启动项目
```
npm run dev
```

### 步骤4：访问系统
打开浏览器，访问：http://localhost:5174

## 四、常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（本地调试） |
| `npm run build` | 构建生产版本（生成dist目录） |
| `npm run preview` | 预览构建后的版本 |

## 五、项目结构

```
warehouse-management/
├── src/                    # 源代码目录
│   ├── components/         # 公共组件
│   ├── pages/              # 页面组件
│   ├── store/              # 状态管理
│   ├── mock/               # 模拟数据
│   ├── types/              # 类型定义
│   └── App.tsx             # 主应用组件
├── public/                 # 静态资源
├── dist/                   # 构建输出（npm run build后生成）
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
└── README-使用说明.md       # 本说明文档
```

## 六、技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **样式方案**：TailwindCSS
- **状态管理**：Zustand
- **UI组件**：自定义组件库

## 七、常见问题

### Q1：npm install 报错？
- 检查 Node.js 版本是否 >= 18
- 尝试清除缓存：`npm cache clean --force`
- 使用国内镜像：`npm config set registry https://registry.npmmirror.com`

### Q2：端口被占用？
项目默认使用 5174 端口，如被占用：
- 修改 `vite.config.ts` 中的 `port` 配置
- 或关闭占用端口的程序

### Q3：页面空白？
- 检查是否正确执行了 `npm install`
- 检查浏览器控制台是否有报错

## 八、联系方式

如有问题，请联系项目负责人。