# 前端部署配置指南

本指南将帮助你部署前端应用并配置后端API接口地址。

## 🚀 快速开始

### 1. 构建生产版本
```bash
# 进入前端目录
cd frontend/aii-home

# 安装依赖
npm install

# 构建生产版本
npm run build:prod
```

### 2. 部署到Web服务器
将 `dist` 目录下的所有文件复制到你的Web服务器根目录。

## ⚙️ 配置后端API地址

### 方法1：修改配置文件（推荐）

部署完成后，用户可以直接修改 `config.js` 文件来配置API地址：

```javascript
// 修改 public/config.js 文件
window.APP_CONFIG = {
  // 修改这里为你的后端API地址
  API_BASE_URL: 'https://your-production-api.com/api',
  
  // 其他配置保持不变
  API_TIMEOUT: 30000,
  DEBUG_MODE: false,
  VERSION: '1.0.0',
  FEATURES: {
    enableAvatarUpload: true,
    enableBackgroundSettings: true,
    enableWordPressIntegration: true
  }
};
```

**优点：**
- ✅ 无需重新构建
- ✅ 用户可以直接修改
- ✅ 支持热更新
- ✅ 配置持久化

### 方法2：通过界面配置

用户可以在应用界面中点击右下角的齿轮图标来打开配置管理面板：

1. 点击右下角的蓝色齿轮按钮
2. 在弹窗中修改API地址
3. 点击"应用配置"
4. 页面会自动重新加载并应用新配置

### 方法3：环境变量配置

如果你有权限修改环境变量，可以在构建时设置：

```bash
# 构建时指定API地址
VITE_API_BASE_URL=https://your-api-domain.com/api npm run build:prod
```

## 🌐 解决前端路由404问题

**重要：** 部署后如果出现页面刷新404或直接访问路由404的问题，需要配置Web服务器支持前端路由。

### Nginx 配置

在 Nginx 配置文件中添加：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    # 处理前端路由 - 关键配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 或者更精确的路由配置
    location ~ ^/(login|signup|profile|create-post|create-status|post|status|admin) {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache 配置

在网站根目录创建 `.htaccess` 文件：

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Express.js 静态服务器

```javascript
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### 为什么需要这个配置？

1. **前端路由是客户端路由**：React Router 只在浏览器中生效
2. **服务器不知道这些路由**：当用户直接访问 `/login` 时，服务器会寻找 `login.html` 文件
3. **构建后的文件结构**：`dist` 目录只有 `index.html`，没有其他页面的HTML文件
4. **配置原理**：告诉服务器"如果找不到文件，就返回 `index.html`，让前端路由处理"

## 🌍 不同环境配置示例

### 开发环境
```javascript
API_BASE_URL: 'http://localhost:9292/api'
DEBUG_MODE: true
```

### 测试环境
```javascript
API_BASE_URL: 'https://test-api.example.com/api'
DEBUG_MODE: true
```

### 生产环境
```javascript
API_BASE_URL: 'https://api.example.com/api'
DEBUG_MODE: false
```

### 内网部署
```javascript
API_BASE_URL: 'http://192.168.1.100:9292/api'
DEBUG_MODE: false
```

## 📁 文件结构说明

```
frontend/aii-home/
├── public/
│   ├── config.js          # 运行时配置文件（用户可修改）
│   ├── .htaccess          # Apache 路由配置
│   └── favicon.ico
├── src/
│   ├── config/
│   │   └── api.ts         # API配置逻辑
│   └── components/
│       └── ui/
│           └── ConfigManager.tsx  # 配置管理界面
├── dist/                  # 构建输出目录
├── nginx.conf             # Nginx 配置示例
└── index.html             # 主页面
```

## 🔧 高级配置

### 自定义功能开关
```javascript
window.APP_CONFIG = {
  // ... 其他配置
  FEATURES: {
    enableAvatarUpload: false,        // 禁用头像上传
    enableBackgroundSettings: true,   // 启用背景设置
    enableWordPressIntegration: false // 禁用WordPress集成
  }
};
```

### 自定义超时时间
```javascript
window.APP_CONFIG = {
  // ... 其他配置
  API_TIMEOUT: 60000,  // 60秒超时
};
```

## 🚨 注意事项

1. **配置文件位置**：确保 `config.js` 文件在 `public` 目录下，构建后会在 `dist` 目录中
2. **文件权限**：确保Web服务器有权限读取 `config.js` 文件
3. **缓存问题**：如果修改配置后没有生效，请清除浏览器缓存
4. **HTTPS要求**：如果前端使用HTTPS，后端API也必须使用HTTPS或配置为允许混合内容
5. **路由配置**：必须配置Web服务器支持前端路由，否则会出现404错误

## 🐛 故障排除

### 配置未生效
- 检查 `config.js` 文件是否正确加载
- 查看浏览器控制台是否有错误信息
- 确认文件路径和权限

### API请求失败
- 验证API地址是否正确
- 检查网络连接和防火墙设置
- 确认后端服务是否运行

### 界面配置不显示
- 检查 `ConfigManager` 组件是否正确引入
- 查看是否有JavaScript错误
- 确认构建是否成功

### 页面刷新404错误
- 检查Web服务器是否正确配置了前端路由支持
- 确认 `try_files` 或 `.htaccess` 配置是否正确
- 查看服务器错误日志

## 📞 技术支持

如果遇到问题，请检查：
1. 浏览器控制台的错误信息
2. 网络请求的状态码
3. 配置文件格式是否正确
4. Web服务器的路由配置是否正确

---

**提示**：
1. 推荐使用"方法1"（修改配置文件），这样用户可以在部署后直接修改，无需重新构建或部署
2. **必须配置Web服务器支持前端路由**，否则会出现页面刷新404的问题
3. 如果使用Docker部署，可以参考项目中的 `docker-compose.yml` 和 `nginx.conf` 配置
