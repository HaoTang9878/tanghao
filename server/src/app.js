/**
 * BruceTang 个人作品集后端主应用
 * 基于 Express,提供认证与文章 API
 * 监听端口由环境变量 PORT 指定,默认 4001
 *
 * 模块说明:
 * - 认证:POST /api/auth/register, POST /api/auth/login,
 *        POST /api/auth/logout, GET /api/auth/me
 * - 文章:GET/POST /api/articles, GET/PUT/DELETE /api/articles/:slug
 * - 监控:GET /api/health
 */
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");

const app = express();

// 初始化数据库(懒加载,首次访问时建表)
initDb();

// 中间件:CORS + JSON 解析
app.use(cors());
app.use(express.json());

/**
 * GET /api/health
 * 健康检查接口(供 Nginx/监控系统使用)
 */
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 业务路由
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: "接口不存在" });
});

// 全局错误处理(记录日志并返回 500)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("[ERROR]", new Date().toISOString(), err.message, err.stack);
    res.status(500).json({ error: "服务器内部错误" });
});

// 启动服务(仅在直接执行时启动,test 时由 supertest require 后使用)
if (require.main === module) {
    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
        console.log(`[brucetanghao-server] listening on http://127.0.0.1:${PORT}`);
    });
}

module.exports = app;
