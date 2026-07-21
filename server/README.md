# BruceTang 作品集后端 API

提供用户认证与文章管理 RESTful API。

## 技术栈

- 运行时:Node.js >= 18
- 框架:Express 4.21
- 存储:基于 JSON 文件的轻量同步存储(零原生依赖,避免 OOM)
- 认证:JWT (jsonwebtoken 9.0)
- 密码:bcryptjs 2.4(纯 JS 实现)

## 快速开始

```bash
cd server
npm install
npm start          # 生产启动,监听 4001
npm run dev        # 开发模式(文件变动自动重启)
npm test           # 运行单元测试并输出覆盖率
```

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| PORT | 4001 | 后端监听端口 |
| JWT_SECRET | brucetanghao-dev-secret-change-in-prod | JWT 签名密钥,生产环境必须修改 |
| JWT_EXPIRES_IN | 7d | JWT 有效期 |

## API 接口列表

### 认证 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| POST | /api/auth/register | 否 | 注册新用户 |
| POST | /api/auth/login | 否 | 登录(支持用户名或邮箱) |
| POST | /api/auth/logout | 是 | 登出 |
| GET | /api/auth/me | 是 | 获取当前用户信息 |

#### 注册示例

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "bruce",
  "email": "bruce@example.com",
  "password": "secret123"
}
```

响应:

```json
{
  "user": {
    "id": 1,
    "username": "bruce",
    "email": "bruce@example.com",
    "display_name": "bruce",
    "created_at": "2026-07-21T12:00:00.000Z",
    "updated_at": "2026-07-21T12:00:00.000Z"
  },
  "token": "eyJhbGci..."
}
```

### 文章 `/api/articles`

| 方法 | 路径 | 认证 | 说明 |
|---|---|---|---|
| GET | /api/articles | 否 | 获取已发布文章列表 |
| GET | /api/articles/:slug | 否 | 获取单篇文章 |
| POST | /api/articles | 是 | 创建文章 |
| PUT | /api/articles/:slug | 是 | 更新文章(仅作者) |
| DELETE | /api/articles/:slug | 是 | 删除文章(仅作者) |

### 监控

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/health | 健康检查 |

## 认证方式

除注册/登录外,需认证的接口要求在请求头携带:

```
Authorization: Bearer <token>
```

token 通过 `/api/auth/login` 或 `/api/auth/register` 获取。

## 测试

```bash
npm test
```

测试使用内存模式,不写入磁盘,保证测试隔离。目标覆盖率 >= 80%。
