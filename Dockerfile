# 构建阶段
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./
# 换成国内 npm 源（淘宝镜像）
RUN npm config set registry https://registry.npmmirror.com
# 安装依赖。Vite 构建需要 devDependencies，所以这里不能只安装 production 依赖。
RUN npm ci
# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/nginx:1.25-alpine

# Docker 运行时可以通过 -e API_UPSTREAM=http://xxx:8888 覆盖后端地址。
ENV API_UPSTREAM=http://localhost:8888

# 复制自定义 nginx 模板，官方 nginx 镜像启动时会自动执行 envsubst。
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
