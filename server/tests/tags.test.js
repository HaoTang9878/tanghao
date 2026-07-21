/**
 * 标签 API 单元测试
 * 覆盖标签列表、按标签筛选文章/项目,以及文章 tags 字段的创建与更新
 * 覆盖草稿文章不参与统计、空标签等边界场景
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode, getDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;

beforeAll(async () => {
    // 注册并登录测试用户
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "writer",
            email: "writer@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "writer", password: "pass123456" });
    token = res.body.token;

    // 准备测试数据:已发布文章(含标签)
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Node 入门",
            slug: "node-intro",
            content: "Node.js 基础教程",
            tags: ["node", "express"],
            status: "published",
        });
    // 第二篇含 node 标签的文章(触发 sort 比较器)
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Node 进阶",
            slug: "node-advanced",
            content: "Node.js 高级技巧",
            tags: ["node"],
            status: "published",
        });
    // 草稿文章(标签不应参与公开统计)
    await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "草稿文章",
            slug: "draft-article",
            tags: ["draft-only"],
            status: "draft",
        });
    // 项目(含标签)
    await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "带标签项目",
            slug: "tagged-project",
            tags: ["node", "react"],
            status: "published",
        });
    // 第二个含 react 标签的项目(触发 sort 比较器)
    await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "React 工具",
            slug: "react-tool",
            tags: ["react"],
            status: "published",
        });
});

afterAll(() => {
    closeDb();
});

describe("文章 tags 字段", () => {
    test("创建文章时支持 tags 参数", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "标签文章",
                slug: "tagged-article",
                content: "内容",
                tags: ["javascript"],
                status: "published",
            });
        expect(res.status).toBe(201);
        expect(res.body.article.tags).toEqual(["javascript"]);
    });

    test("未传 tags 时默认为空数组", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "无标签文章",
                slug: "no-tag-article",
                status: "published",
            });
        expect(res.status).toBe(201);
        expect(res.body.article.tags).toEqual([]);
    });

    test("tags 非数组时被规范化为空数组", async () => {
        const res = await request(app)
            .post("/api/articles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "非法标签",
                slug: "bad-tags",
                tags: "not-array",
                status: "published",
            });
        expect(res.status).toBe(201);
        expect(res.body.article.tags).toEqual([]);
    });

    test("更新文章 tags 字段", async () => {
        const res = await request(app)
            .put("/api/articles/node-intro")
            .set("Authorization", `Bearer ${token}`)
            .send({ tags: ["node", "updated"] });
        expect(res.status).toBe(200);
        expect(res.body.article.tags).toEqual(["node", "updated"]);
    });
});

describe("标签列表 GET /api/tags", () => {
    test("返回按使用频率倒序的标签列表", async () => {
        const res = await request(app).get("/api/tags");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.tags)).toBe(true);

        // node 出现在 2 篇已发布文章 + 1 个项目 = 3 次
        const nodeTag = res.body.tags.find((t) => t.tag === "node");
        expect(nodeTag).toBeDefined();
        expect(nodeTag.count).toBe(3);

        // draft-only 仅在草稿文章中,不应出现
        const draftTag = res.body.tags.find((t) => t.tag === "draft-only");
        expect(draftTag).toBeUndefined();
    });

    test("标签列表按 count 倒序排列", async () => {
        const res = await request(app).get("/api/tags");
        const counts = res.body.tags.map((t) => t.count);
        const sorted = [...counts].sort((a, b) => b - a);
        expect(counts).toEqual(sorted);
    });
});

describe("按标签获取文章 GET /api/tags/:tag/articles", () => {
    test("返回带指定标签的已发布文章", async () => {
        const res = await request(app).get("/api/tags/node/articles");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.articles)).toBe(true);
        expect(res.body.articles.length).toBeGreaterThan(0);
        // 列表不含 content 字段
        expect(res.body.articles[0].content).toBeUndefined();
        // 每篇文章都包含 node 标签
        res.body.articles.forEach((a) => {
            expect(a.tags).toContain("node");
        });
    });

    test("草稿文章不出现在标签文章列表", async () => {
        const res = await request(app).get(
            "/api/tags/draft-only/articles"
        );
        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
    });

    test("不存在的标签返回空列表", async () => {
        const res = await request(app).get(
            "/api/tags/nonexistent-tag/articles"
        );
        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
    });
});

describe("按标签获取项目 GET /api/tags/:tag/projects", () => {
    test("返回带指定标签的项目", async () => {
        const res = await request(app).get("/api/tags/react/projects");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.projects)).toBe(true);
        expect(res.body.projects.length).toBeGreaterThan(0);
        res.body.projects.forEach((p) => {
            expect(p.tags).toContain("react");
        });
    });

    test("不存在的标签返回空项目列表", async () => {
        const res = await request(app).get(
            "/api/tags/nonexistent-tag/projects"
        );
        expect(res.status).toBe(200);
        expect(res.body.projects).toEqual([]);
    });
});

describe("错误处理", () => {
    test("标签列表数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.articles;
        db.articles = null;
        const res = await request(app).get("/api/tags");
        expect(res.status).toBe(500);
        db.articles = original;
    });

    test("按标签获取文章数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.articles;
        db.articles = null;
        const res = await request(app).get("/api/tags/node/articles");
        expect(res.status).toBe(500);
        db.articles = original;
    });

    test("按标签获取项目数据库异常返回 500", async () => {
        const db = getDb();
        const original = db.projects;
        db.projects = null;
        const res = await request(app).get("/api/tags/react/projects");
        expect(res.status).toBe(500);
        db.projects = original;
    });
});

describe("空库场景", () => {
    test("无数据时返回空标签列表", async () => {
        // 重置数据库为空内存状态
        closeDb();
        setMemoryMode();
        // 触发 initDb 重建空库
        getDb();

        const res = await request(app).get("/api/tags");
        expect(res.status).toBe(200);
        expect(res.body.tags).toEqual([]);

        // 空库下按标签查询也返回空
        const artRes = await request(app).get(
            "/api/tags/any/articles"
        );
        expect(artRes.body.articles).toEqual([]);

        const projRes = await request(app).get(
            "/api/tags/any/projects"
        );
        expect(projRes.body.projects).toEqual([]);
    });
});
