<div align="center">

# 🍃 Leaf Blog Frontend

**基于 Vue 3 + Element Plus 构建的现代化博客前台系统**

[![Vue](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.5.0-409EFF?style=flat-square&logo=element&logoColor=white)](https://element-plus.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D16-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

[在线演示](https://your-demo-site.com) · [问题反馈](https://github.com/yourusername/blog-frontend/issues) · [功能建议](https://github.com/yourusername/blog-frontend/issues/new)

</div>

---

## 📑 目录

- [📸 预览](#-预览)
- [✨ 功能特性](#-功能特性)
- [🛠️ 技术栈](#️-技术栈)
- [📁 项目结构](#-项目结构)
- [🚀 快速开始](#-快速开始)
  - [环境要求](#环境要求)
  - [安装依赖](#安装依赖)
  - [开发模式](#开发模式)
  - [生产构建](#生产构建)
- [⚙️ 配置说明](#️-配置说明)
- [📚 开发指南](#-开发指南)
- [🌐 API 接口](#-api-接口)
- [📦 部署方式](#-部署方式)
- [⚡ 性能优化](#-性能优化)
- [🌏 浏览器支持](#-浏览器支持)
- [📝 许可证](#-许可证)

---

## 📸 预览

### 🖥️ 桌面端展示

<table>
  <tr>
    <td align="center"><b>首页</b></td>
    <td align="center"><b>文章列表</b></td>
  </tr>
  <tr>
    <td><img src="img/img.png" alt="首页" width="400"/></td>
    <td><img src="img/img_1.png" alt="文章列表" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>文章详情</b></td>
    <td align="center"><b>个人中心</b></td>
  </tr>
  <tr>
    <td><img src="img/img_2.png" alt="文章详情" width="400"/></td>
    <td><img src="img/img_3.png" alt="个人中心" width="400"/></td>
  </tr>
</table>


---

## ✨ 功能特性

### 👤 用户系统
- ✅ 用户注册/登录
- ✅ 个人中心管理
- ✅ 账号信息设置
- ✅ 密码修改功能
- ✅ 完善的权限控制

### 📝 文章系统
- ✅ 文章列表展示（支持分页）
- ✅ 文章详情查看
- ✅ Markdown 渲染（支持代码高亮）
- ✅ 文章搜索功能
- ✅ 分类筛选
- ✅ 多维度排序
- ✅ 文章归档视图

### 💬 互动功能
- ✅ 文章点赞/取消点赞
- ✅ 文章收藏/取消收藏
- ✅ 发表评论
- ✅ 评论回复
- ✅ 评论点赞
- ✅ 留言板功能

### 🎨 界面特性
- ✅ 响应式布局设计
- ✅ 优雅的动画效果
- ✅ 深色/浅色主题切换（规划中）
- ✅ 热门文章推荐
- ✅ 标签云展示
- ✅ 站点统计面板

### 🔐 安全特性
- ✅ 路由守卫保护
- ✅ Token 认证机制
- ✅ 用户状态持久化
- ✅ 统一错误处理
- ✅ 请求拦截器

---

## 🛠️ 技术栈

| 类型 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 🖼️ **前端框架** | Vue 3 | ^3.4.0 | 采用 Composition API |
| 🧭 **路由管理** | Vue Router | ^4.2.5 | 官方路由解决方案 |
| 📦 **状态管理** | Pinia | ^2.1.7 | 新一代状态管理 |
| 🎨 **UI 组件库** | Element Plus | ^2.5.0 | 丰富的组件库 |
| 🔌 **HTTP 客户端** | Axios | ^1.6.2 | Promise HTTP 库 |
| 📄 **Markdown** | markdown-it | ^14.0.0 | Markdown 解析器 |
| 🎯 **代码高亮** | highlight.js | ^11.11.1 | 语法高亮支持 |
| 📅 **日期处理** | dayjs | ^1.11.10 | 轻量级日期库 |
| ⚡ **构建工具** | Vite | ^5.0.0 | 下一代前端工具 |

---

## 📁 项目结构

```
leaf-ui-frontend/
├── 📄 package.json          # 项目依赖配置
├── ⚙️ vite.config.js        # Vite 配置文件
├── 📄 index.html            # HTML 入口文件
├── 📂 public/               # 静态资源文件
├── 📂 screenshots/          # 项目截图文件夹
└── 📂 src/
    ├── 🎯 main.js           # 应用入口
    ├── 📱 App.vue           # 根组件
    ├── 📂 router/           # 路由配置
    │   └── index.js
    ├── 📂 stores/           # Pinia 状态管理
    │   └── user.js          # 用户状态
    ├── 📂 api/              # API 接口封装
    │   ├── request.js       # Axios 封装
    │   ├── auth.js          # 认证相关接口
    │   ├── article.js       # 文章相关接口
    │   ├── comment.js       # 评论相关接口
    │   ├── chapter.js       # 章节相关接口
    │   ├── tag.js           # 标签相关接口
    │   └── stats.js         # 统计相关接口
    ├── 📂 composables/      # 组合式函数
    │   ├── useHeartbeat.js  # 心跳检测
    │   └── useVisitTracking.js # 访问追踪
    ├── 📂 layouts/          # 布局组件
    │   └── MainLayout.vue
    ├── 📂 views/            # 页面组件
    │   ├── Home.vue         # 🏠 首页
    │   ├── Articles.vue     # 📋 文章列表
    │   ├── ArticleDetail.vue # 📄 文章详情
    │   ├── Archive.vue      # 📚 归档页面
    │   ├── About.vue        # ℹ️ 关于页面
    │   ├── Guestbook.vue    # 💭 留言板
    │   ├── Login.vue        # 🔐 登录/注册
    │   └── Profile.vue      # 👤 个人中心
    └── 📂 components/       # 公共组件
        ├── ArticleCard.vue  # 文章卡片
        ├── Comment.vue      # 评论组件
        └── Header.vue       # 导航栏
```

---

## 🚀 快速开始

### 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- 📦 **Node.js** >= 16.0.0
- 📦 **npm** >= 8.0.0 或 **yarn** >= 1.22.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/ydcloud-dy/leaf-ui-frontend.git

# 进入项目目录
cd leaf-ui-frontend

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev
```

🌐 项目将在 http://localhost:3000 启动，支持热更新

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

📦 构建产物将生成在 `dist` 目录

---

## ⚙️ 配置说明

### API 配置

项目默认后端地址为 `http://localhost:8888`。如需修改，请编辑 `vite.config.js`：

```javascript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',  // 👈 修改为你的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 环境变量

支持通过环境变量配置：

```bash
# .env.development
VITE_API_URL=http://localhost:8888

# .env.production
VITE_API_URL=https://api.yourdomain.com
```

---

## 📚 开发指南

### 路由配置

路由配置位于 `src/router/index.js`，采用嵌套路由结构：

| 路径 | 组件 | 说明 | 权限 |
|------|------|------|------|
| `/` | Home.vue | 🏠 首页 | 公开 |
| `/articles` | Articles.vue | 📋 文章列表 | 公开 |
| `/articles/:id` | ArticleDetail.vue | 📄 文章详情 | 公开 |
| `/archive` | Archive.vue | 📚 归档页面 | 公开 |
| `/guestbook` | Guestbook.vue | 💭 留言板 | 公开 |
| `/about` | About.vue | ℹ️ 关于页面 | 公开 |
| `/login` | Login.vue | 🔐 登录/注册 | 公开 |
| `/profile` | Profile.vue | 👤 个人中心 | 🔒 需登录 |

### 状态管理

使用 Pinia 管理全局状态：

```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 用户信息
userStore.userInfo

// 登录状态
userStore.isLoggedIn

// 方法
userStore.login(credentials)
userStore.logout()
```

### API 调用示例

```javascript
import { getArticles, getArticleById } from '@/api/article'

// 获取文章列表
const { data } = await getArticles({
  page: 1,
  page_size: 10,
  category: 'tech'
})

// 获取文章详情
const article = await getArticleById(1)
```

### 样式规范

- 🎨 使用 Element Plus 主题色系
- 📱 响应式断点：`768px`
- 🔒 采用 `scoped` 样式避免全局污染
- 🌈 支持 CSS 变量自定义主题

---

## 🌐 API 接口

项目需要以下后端接口支持：

<details>
<summary><b>🔐 认证接口</b></summary>

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/register` | 用户注册 |
| GET | `/auth/me` | 获取当前用户信息 |
| PUT | `/auth/profile` | 更新用户信息 |
| PUT | `/auth/password` | 修改密码 |

</details>

<details>
<summary><b>📝 文章接口</b></summary>

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/articles` | 获取文章列表 |
| GET | `/articles/:id` | 获取文章详情 |
| GET | `/articles/search` | 搜索文章 |
| GET | `/articles/archive` | 获取归档文章 |
| POST | `/articles/:id/like` | 点赞文章 |
| DELETE | `/articles/:id/like` | 取消点赞 |
| POST | `/articles/:id/favorite` | 收藏文章 |
| DELETE | `/articles/:id/favorite` | 取消收藏 |

</details>

<details>
<summary><b>💬 评论接口</b></summary>

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/comments` | 获取评论列表 |
| GET | `/articles/:id/comments` | 获取文章评论 |
| POST | `/comments` | 发表评论 |
| POST | `/comments/:id/reply` | 回复评论 |
| DELETE | `/comments/:id` | 删除评论 |
| POST | `/comments/:id/like` | 点赞评论 |

</details>

<details>
<summary><b>👤 用户数据接口</b></summary>

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/user/likes` | 获取我的点赞 |
| GET | `/user/favorites` | 获取我的收藏 |

</details>

---

## 📦 部署方式

### 🖥️ 裸部署

#### 自动部署脚本

```bash
# 运行部署脚本
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

#### 手动部署

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 使用 Nginx 部署
# 将 dist 目录复制到 Nginx 的 html 目录
sudo cp -r dist/* /usr/share/nginx/html/

# 4. 配置 Nginx（参考 deploy/nginx/nginx.conf）
sudo systemctl restart nginx
```

---

### 🐳 Docker 部署

#### 构建镜像

```bash
docker build -t blog-frontend:latest .
```

#### 运行容器

```bash
docker run -d \
  --name blog-frontend \
  -p 3000:80 \
  -e API_URL=http://your-api-server:8888 \
  blog-frontend:latest
```

---

### 🐙 Docker Compose 部署

在项目根目录执行：

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f blog-frontend

# 停止服务
docker-compose down
```

---

### ☸️ Kubernetes 部署

#### 创建命名空间和资源

```bash
# 应用 K8s 配置
kubectl apply -f deploy/k8s/deployment.yaml
```

#### 检查部署状态

```bash
# 查看 Pod
kubectl get pods -n leaf-blog

# 查看服务
kubectl get svc -n leaf-blog

# 查看日志
kubectl logs -f <pod-name> -n leaf-blog
```

#### 访问服务

```bash
# 端口转发（用于测试）
kubectl port-forward svc/blog-frontend-service 3000:80 -n leaf-blog

# 或配置 Ingress 后通过域名访问
```

---

## ⚡ 性能优化

### ✅ 已实施的优化

- ⚡ 使用 Vite 进行快速构建和热更新
- 📦 生产构建自动进行代码分割和压缩
- 🗜️ 启用 Gzip 压缩（Nginx 配置）
- 💾 配置浏览器缓存策略
- 🎨 Element Plus 按需引入
- 🖼️ 图片懒加载

### 🚀 推荐的优化措施

- 📍 使用 CDN 托管静态资源
- 🖼️ 图片资源使用 WebP 格式
- 🔄 启用 HTTP/2
- 📊 配置性能监控
- 🎯 使用 PWA 技术提升用户体验

---

## 🌏 浏览器支持

| 浏览器 | 版本要求 |
|--------|----------|
| 🌐 Chrome | >= 90 |
| 🦊 Firefox | >= 88 |
| 🧭 Safari | >= 14 |
| 📘 Edge | >= 90 |

---

## ⚠️ 注意事项

1. ⚙️ 确保后端服务已启动在 `http://localhost:8888`
2. 📦 首次运行需要安装依赖：`npm install`
3. 🔧 如需修改端口，请编辑 `vite.config.js` 中的 `server.port`
4. 🔐 Token 存储在 localStorage 中
5. 🖼️ 图片资源需要配置正确的 CDN 地址或本地路径
6. 🌐 生产部署时需要配置正确的 API 地址
7. 🗜️ 使用 Nginx 部署时需要配置 gzip 压缩和缓存策略

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. 🍴 Fork 本仓库
2. 🌿 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🎉 提交 Pull Request

---

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📮 联系方式

- 📧 Email: dycloudlove@163.com
- 💬 问题反馈: [Issues](https://github.com/ydcloud-dy/leaf-ui-frontend/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！⭐**

Made with ❤️ by [J.](https://github.com/yourusername)

</div>
