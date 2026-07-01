# 腾讯云CDN + 边缘函数部署指南（完整版）

## 方案概述
使用腾讯云CDN作为代理，回源到COS存储桶，并通过边缘函数过滤掉 `Content-Disposition: attachment` 头部，使浏览器能正常显示HTML页面而不是下载。

---

## 第一步：创建CDN加速域名

### 1.1 进入CDN控制台
浏览器打开：https://console.cloud.tencent.com/cdn

### 1.2 添加域名
点击「添加域名」按钮，填写以下配置：

```
加速域名：warehouse.yourdomain.com
        （或使用随机域名，稍后我会告诉你）

业务类型：静态加速

源站类型：COS对象存储

回源协议：HTTPS

选择Bucket：warehouse-management-1306169712

所属地域：广州
```

### 1.3 确认配置
点击「确认」，等待域名配置生效（通常5-10分钟）

---

## 第二步：创建边缘函数

### 2.1 进入边缘函数控制台
打开：https://console.cloud.tencent.com/edgeone/functions

### 2.2 创建函数
点击「创建函数」→「HTTP函数」

### 2.3 配置函数
- **函数名称**：`fix-content-disposition`
- **运行时环境**：Node.js 18.x

### 2.4 复制代码
复制以下代码到编辑器中：

```javascript
async function handleRequest(request) {
  const url = new URL(request.url);
  const cosUrl = `https://warehouse-management-1306169712.cos.ap-guangzhou.myqcloud.com${url.pathname}`;
  
  try {
    const response = await fetch(cosUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const body = await response.arrayBuffer();
    
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-disposition') {
        headers.set(key, value);
      }
    });
    headers.set('Content-Disposition', 'inline');
    headers.set('Cache-Control', 'no-cache');
    
    return new Response(body, {
      status: response.status,
      headers: headers,
    });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 502 });
  }
}

export { handleRequest };
```

### 2.5 部署函数
点击「部署」，等待部署完成

### 2.6 获取函数URL
部署成功后，会获得一个函数访问URL，类似：
```
https://functions.cn-hangzhou.tencentutils.com/xxx/fix-content-disposition
```

---

## 第三步：配置CDN回源到边缘函数

### 3.1 回到CDN控制台
编辑刚才创建的加速域名

### 3.2 修改源站配置
将源站类型改为：
```
源站类型：接入域名
回源协议：HTTP
接入域名：粘贴第二步获得的函数URL
```

### 3.3 保存配置

---

## 第四步：验证部署

### 4.1 等待生效
CDN配置通常需要5-15分钟完全生效

### 4.2 访问测试
用浏览器打开你的加速域名，应该能看到仓库管理系统页面

---

## 重要提示

1. **加速域名**：如果没有自己的域名，CDN会给你一个默认域名
2. **HTTPS**：需要为域名配置SSL证书（CDN可以自动申请免费证书）
3. **费用**：CDN有按量计费，国内流量约0.21元/GB，静态网站流量很小

---

## 遇到问题？

如果配置过程中遇到任何问题，随时截图给我，我来帮你解决！
