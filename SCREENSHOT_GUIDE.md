# 截图指南

## 如何获取项目截图

### 1. 启动项目

```bash
# 确保后端服务运行在 http://localhost:8888
npm run dev
```

### 2. 访问各个页面并截图

访问 http://localhost:3000，依次访问以下页面并截图：

#### 必需的截图

1. **首页** (`screenshots/home.png`)
   - 访问: http://localhost:3000
   - 截图内容: 首页文章列表 + 右侧热门文章栏

2. **文章详情** (`screenshots/article-detail.png`)
   - 访问: http://localhost:3000/articles/1 (选择任意文章)
   - 截图内容: Markdown 渲染效果，包含代码高亮

3. **笔记分类** (`screenshots/notes.png`)
   - 访问: http://localhost:3000/notes
   - 截图内容: 左侧分类栏 + 右侧章节目录

4. **网站统计** (`screenshots/stats.png`)
   - 访问: http://localhost:3000/stats
   - 截图内容: 统计卡片和图表

#### 可选的截图

5. **文章归档** (`screenshots/archive.png`)
   - 访问: http://localhost:3000/archive

6. **留言板** (`screenshots/guestbook.png`)
   - 访问: http://localhost:3000/guestbook

7. **登录页面** (`screenshots/login.png`)
   - 访问: http://localhost:3000/login

8. **个人中心** (`screenshots/profile.png`)
   - 访问: http://localhost:3000/profile (需要登录)

### 3. 添加截图到 README

截图保存到 `screenshots/` 目录后，编辑主 README.md，在"项目展示"部分添加：

```markdown
## 项目展示

### 首页
![首页](screenshots/home.png)

### 文章详情
![文章详情](screenshots/article-detail.png)

### 笔记分类
![笔记分类](screenshots/notes.png)

### 网站统计
![网站统计](screenshots/stats.png)
```

## 截图建议

- 使用浏览器的全屏截图功能
- 推荐分辨率: 1920x1080 或 1440x900
- 截图格式: PNG（保证清晰度）
- 文件大小: 建议压缩到 500KB 以内
- 确保截图中有实际的数据内容（不要空白页面）
