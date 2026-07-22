/**
 * BruceTang 个人作品集后端主应用
 * 基于 Express,提供认证、文章、书籍、项目、论坛、标签、搜索、统计 API
 * 监听端口由环境变量 PORT 指定,默认 4001
 *
 * 模块说明:
 * - 认证:POST /api/auth/register, POST /api/auth/login,
 *        POST /api/auth/logout, GET /api/auth/me
 * - 文章:GET/POST /api/articles, GET/PUT/DELETE /api/articles/:slug
 * - 书籍:GET/POST /api/books, GET/PUT/DELETE /api/books/:slug
 * - 项目:GET/POST /api/projects, GET/PUT/DELETE /api/projects/:slug
 * - 论文:GET/POST /api/papers, GET/PUT/DELETE /api/papers/:id
 * - 专利:GET/POST /api/patents, GET/PUT/DELETE /api/patents/:id
 * - 软件:GET/POST /api/software, GET/PUT/DELETE /api/software/:id
 * - 论坛:GET/POST /api/forum/topics, GET /api/forum/topics/:slug,
 *        POST /api/forum/topics/:slug/replies,
 *        DELETE /api/forum/topics/:slug
 * - 标签:GET /api/tags, GET /api/tags/:tag/articles,
 *        GET /api/tags/:tag/projects
 * - 搜索:GET /api/search?q=关键词
 * - 统计:GET /api/stats
 * - 报告:GET /api/reports/daily, GET /api/reports/daily/:date,
 *        GET /api/reports/weekly, GET /api/reports/weekly/:week,
 *        GET /api/reports/monthly, GET /api/reports/monthly/:month
 * - 监控:GET /api/health
 */
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const bookRoutes = require("./routes/books");
const projectRoutes = require("./routes/projects");
const paperRoutes = require("./routes/papers");
const patentRoutes = require("./routes/patents");
const softwareRoutes = require("./routes/software");
const forumRoutes = require("./routes/forum");
const tagRoutes = require("./routes/tags");
const searchRoutes = require("./routes/search");
const statsRoutes = require("./routes/stats");
const reportRoutes = require("./routes/reports");

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
app.use("/api/books", bookRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/patents", patentRoutes);
app.use("/api/software", softwareRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reports", reportRoutes);

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
