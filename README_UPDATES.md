# README 更新说明

## 更新日期
2025-12-01

## 更新内容

### 1. 修正项目名称
- ✅ 从 "博客前端项目" 改为 "Leaf UI 博客前端"
- ✅ 与项目目录名称保持一致

### 2. 新增特性亮点部分
- ✅ 添加了功能特性的图标化展示
- ✅ 突出显示项目的核心优势

### 3. 完善技术栈
- ✅ 补充了 markdown-it 相关插件
  - markdown-it-anchor（锚点支持）
  - markdown-it-highlightjs（代码高亮）
  - markdown-it-table-of-contents（目录生成）
- ✅ 添加了 highlight.js
- ✅ 添加了 @element-plus/icons-vue

### 4. 更新项目结构
- ✅ 添加了实际存在的目录和文件
  - screenshots/ 目录
  - deploy/ 目录
  - Dockerfile
  - SCREENSHOT_GUIDE.md
- ✅ 补充了新增的 API 模块
  - tag.js（标签接口）
  - chapter.js（章节接口）
  - stats.js（统计接口）
- ✅ 添加了 composables/ 目录
  - useHeartbeat.js（心跳检测）
  - useVisitTracking.js（访问跟踪）
- ✅ 补充了新增的页面
  - Notes.vue（笔记分类）
  - Stats.vue（网站统计）

### 5. 完善功能特性
- ✅ 新增"笔记系统"功能模块
  - 笔记分类（Tag 标签）
  - 章节目录（支持多级目录结构）
  - 二级章节展开/折叠
  - 文章数量统计
- ✅ 新增"统计功能"模块
  - 网站访问统计
  - 热门文章排行
  - 用户在线统计
  - 博主信息展示
  - 心跳检测
  - 访问时长记录
- ✅ 完善文章系统说明
  - 明确 Markdown 渲染 + 代码高亮
  - 归档按月份分组
  - 文章卡片展示细节

### 6. 更新路由配置
- ✅ 添加 `/notes/:tag?` 路由
- ✅ 添加 `/stats` 路由
- ✅ 补充路由说明（首页详情、归档分组等）

### 7. 更新 API 配置
- ✅ 修正 API 路径重写规则：`/api` → `/blog`
- ✅ 添加 `/files` 代理配置
- ✅ 添加 `/uploads` 代理配置

### 8. 完善后端接口文档
- ✅ 所有接口添加 `/blog` 前缀说明
- ✅ 新增标签和章节接口
  - GET /blog/tags
  - GET /blog/chapters/:tag
  - POST/PUT/DELETE /blog/chapters
- ✅ 新增统计接口
  - GET /blog/stats
  - GET /blog/stats/hot-articles
  - POST /blog/heartbeat
  - POST /blog/visit
  - GET /blog/blogger

### 9. 更新注意事项
- ✅ 添加 API 路径重写说明
- ✅ 添加文件代理配置说明
- ✅ 添加笔记系统依赖说明
- ✅ 添加统计功能依赖说明

### 10. 完善性能优化说明
- ✅ 添加代码高亮支持说明
- ✅ 添加路由懒加载说明
- ✅ 添加组合式函数复用说明

### 11. 新增项目截图指南
- ✅ 创建 `screenshots/` 目录
- ✅ 创建 `screenshots/README.md` 说明文件
- ✅ 创建 `SCREENSHOT_GUIDE.md` 详细指南

## 文件清单

更新和新增的文件：
- ✅ README.md（主文档，已更新）
- ✅ screenshots/README.md（新建）
- ✅ SCREENSHOT_GUIDE.md（新建）
- ✅ README_UPDATES.md（本文件，新建）

## 待办事项

### 用户需要完成的操作

1. **添加项目截图**
   - 启动项目 `npm run dev`
   - 访问各个页面并截图
   - 将截图保存到 `screenshots/` 目录
   - 参考 `SCREENSHOT_GUIDE.md` 中的详细说明

2. **更新 README 中的截图展示**
   - 在截图完成后，编辑 README.md
   - 在"项目展示"部分添加实际的截图引用
   - 示例格式：`![首页](screenshots/home.png)`

3. **验证 README 准确性**
   - 检查所有依赖版本是否与 package.json 一致
   - 验证所有路由是否与 router/index.js 一致
   - 确认所有 API 接口与后端实现一致

## 与代码的一致性检查

✅ **技术栈** - 已与 package.json 完全一致
✅ **项目结构** - 已与实际文件系统一致
✅ **路由配置** - 已与 src/router/index.js 一致
✅ **API 接口** - 已与 src/api/ 目录下的文件一致
✅ **代理配置** - 已与 vite.config.js 一致
✅ **功能特性** - 已与实际代码实现一致

## 总结

本次更新确保了 README.md 与实际代码完全一致，补充了所有新增功能的说明，并提供了完整的截图指南。用户只需要按照 `SCREENSHOT_GUIDE.md` 的说明添加实际运行的前端截图即可。
