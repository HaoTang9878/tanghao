# 服务器运维手记

> 运维是一门实践的艺术，细节决定成败 —— 这里记录真实踩坑与排查经验

记录服务器运维过程中的实战经验，涵盖 Linux 系统管理、Nginx 反向代理、Docker 容器化与常见故障排查。每条都来自真实生产环境的教训。

## Linux 服务器基础配置

新拿到一台服务器，第一件事不是装应用，而是做好基础安全加固。下面是固定的初始化流程。

### 用户与权限

```bash
# 创建部署专用用户，避免直接用 root 操作
adduser deploy
# 加入 sudo 组，需要提权时再 sudo
usermod -aG sudo deploy

# 禁止 root 直接远程登录（改完确保 deploy 能 sudo 再操作）
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
```

### SSH 安全加固

```bash
# 改默认端口，减少自动扫描噪声
Port 22022

# 强制使用密钥登录，禁用密码
PasswordAuthentication no
PubkeyAuthentication yes

# 重启 sshd 生效（保留当前会话，先开一个新终端测试能否登录！）
systemctl restart sshd
```

关键教训：改 SSH 配置后，**务必保留当前会话不要断开**，另开终端验证新配置能登录，否则一旦配错会把自己锁在门外。

### 防火墙（ufw）

```bash
# 只放行必要端口：SSH、HTTP、HTTPS
ufw default deny incoming
ufw default allow outgoing
ufw allow 22022/tcp   # 对应改过的 SSH 端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose
```

ufw 比 iptables 规则好记太多，配置完用 `status` 复核一遍端口策略，确认没有意外放开的端口。

## Nginx 反向代理配置实战

最常见的场景：前端静态资源 + 后端 API 反向代理到 Node 服务。

### 基础反向代理

```nginx
server {
    listen 80;
    server_name brucetanghao.com;

    # 前端静态资源
    root /var/www/blog;
    index index.html;

    # SPA 回退：找不到文件时回退到入口页
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到后端 Node 服务
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### HTTPS 与重定向

```nginx
# 80 端口统一跳转到 HTTPS
server {
    listen 80;
    server_name brucetanghao.com;
    return 301 https://$host$request_uri;
}

# 443 配置证书（用 certbot 自动签发与续期）
server {
    listen 443 ssl http2;
    server_name brucetanghao.com;
    ssl_certificate     /etc/letsencrypt/live/brucetanghao.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/brucetanghao.com/privkey.pem;
}
```

配置后务必 `nginx -t` 检查语法，再 `systemctl reload nginx` 平滑重载——reload 不会断开现有连接，比 restart 更安全。

## Docker 容器化部署

### Dockerfile 最佳实践

```dockerfile
# 多阶段构建：构建环境与运行环境分离，缩小镜像体积
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev        # 安装生产依赖，比 install 更快更可复现
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

要点：用 `.dockerignore` 排除 `node_modules`、`.git`，避免把本地依赖拷进镜像导致平台不一致。

### Docker Compose 编排

```yaml
version: "3.8"
services:
    web:
        build: .
        ports:
            - "3000:3000"
        restart: unless-stopped
        environment:
            - NODE_ENV=production
        volumes:
            - ./data:/app/data   # 持久化数据，避免容器销毁丢数据
```

`restart: unless-stopped` 保证进程异常退出后自动拉起，但 `docker stop` 时不会自启——这正是想要的语义。

## 常见故障排查

### OOM（内存不足）

```bash
# 查看内存与 swap 使用
free -h

# 找出占用内存最多的进程
ps aux --sort=-%mem | head -10

# 查看 OOM Killer 是否杀过进程（被杀的会有记录）
dmesg | grep -i "killed process"
```

应对：临时加 swap 应急，长期靠优化内存泄漏或升级配置。

### 磁盘满

```bash
# 查看磁盘占用
df -h

# 定位大文件所在目录
du -h --max-depth=1 /var | sort -rh | head

# 常见元凶：Docker 镜像与日志
docker system prune -af         # 清理无用镜像与悬空容器
journalctl --vacuum-time=3d     # 只保留最近 3 天系统日志
```

教训：Nginx 与应用的 access log 是无声的磁盘杀手，定期 logrotate 或限制大小非常必要。

### 端口占用

```bash
# 查看 3000 端口被谁占用
ss -tlnp | grep :3000
# 或用 lsof
lsof -i :3000
```

定位到 PID 后，确认是预期进程就直接用，是僵尸进程就 `kill -9 <PID>` 干掉。先用 `ss` 而非 `netstat`，前者更快且默认显示进程信息。

---

> 运维是一门实践的艺术，细节决定成败。
