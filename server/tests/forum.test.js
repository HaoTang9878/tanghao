/**
 * 论坛 API 单元测试
 * 覆盖主题列表、主题详情(含回复)、创建主题、创建回复、删除主题等场景
 * 覆鉴权场景(未登录、他人主题等),以及字段校验
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式,保证测试隔离
process.env.JWT_SECRET = "test-secret";
const { setMemoryMode } = require("../src/db");
setMemoryMode();

const app = require("../src/app");
const { closeDb } = require("../src/db");

let token;
let otherToken;
const TEST_SLUG = "welcome-topic";

beforeAll(async () => {
    // 注册并登录两个测试用户,用于验证权限
    await request(app)
        .post("/api/auth/register")
        .send({
            username: "poster",
            email: "poster@test.com",
            password: "pass123456",
        });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "poster", password: "pass123456" });
    token = res.body.token;

    await request(app)
        .post("/api/auth/register")
        .send({
            username: "commenter",
            email: "commenter@test.com",
            password: "pass123456",
        });
    const res2 = await request(app)
        .post("/api/auth/login")
        .send({ username: "commenter", password: "pass123456" });
    otherToken = res2.body.token;
});

afterAll(() => {
    closeDb();
});

describe("主题列表 GET /api/forum/topics", () => {
    test("空列表返回 200", async () => {
        const res = await request(app).get("/api/forum/topics");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.topics)).toBe(true);
    });

    test("列表不含 content 字段", async () => {
        // 先创建一个主题
        await request(app)
            .post("/api/forum/topics")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "欢迎贴",
                slug: TEST_SLUG,
                content: "正文内容",
            });
        const res = await request(app).get("/api/forum/topics");
        expect(res.status).toBe(200);
        expect(res.body.topics.length).toBeGreaterThan(0);
        expect(res.body.topics[0].content).toBeUndefined();
    });
});

describe("创建主题 POST /api/forum/topics", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post("/api/forum/topics")
            .send({ title: "t", slug: "s" });
        expect(res.status).toBe(401);
    });

    test("缺少参数返回 400", async () => {
        const res = await request(app)
            .post("/api/forum/topics")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "only-title" });
        expect(res.status).toBe(400);
    });

    test("登录后成功创建返回 201", async () => {
        const res = await request(app)
            .post("/api/forum/topics")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "第二个主题",
                slug: "second-topic",
                content: "内容二",
            });
        expect(res.status).toBe(201);
        expect(res.body.topic.slug).toBe("second-topic");
        expect(res.body.topic.views).toBe(0);
        expect(res.body.topic.reply_count).toBe(0);
        expect(res.body.topic.user_id).toBeDefined();
    });

    test("重复 slug 返回 409", async () => {
        const res = await request(app)
            .post("/api/forum/topics")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "重复", slug: TEST_SLUG });
        expect(res.status).toBe(409);
    });
});

describe("主题详情 GET /api/forum/topics/:slug", () => {
    test("存在的 slug 返回 200 并自增浏览数", async () => {
        const r1 = await request(app).get(`/api/forum/topics/${TEST_SLUG}`);
        expect(r1.status).toBe(200);
        expect(r1.body.topic.title).toBe("欢迎贴");
        const views1 = r1.body.topic.views;
        // 再次访问,浏览数应自增
        const r2 = await request(app).get(`/api/forum/topics/${TEST_SLUG}`);
        expect(r2.body.topic.views).toBe(views1 + 1);
    });

    test("详情包含回复列表", async () => {
        const res = await request(app).get(`/api/forum/topics/${TEST_SLUG}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.replies)).toBe(true);
    });

    test("不存在的 slug 返回 404", async () => {
        const res = await request(app).get("/api/forum/topics/not-exist");
        expect(res.status).toBe(404);
    });
});

describe("创建回复 POST /api/forum/topics/:slug/replies", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .post(`/api/forum/topics/${TEST_SLUG}/replies`)
            .send({ content: "hi" });
        expect(res.status).toBe(401);
    });

    test("内容为空返回 400", async () => {
        const res = await request(app)
            .post(`/api/forum/topics/${TEST_SLUG}/replies`)
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "   " });
        expect(res.status).toBe(400);
    });

    test("主题不存在返回 404", async () => {
        const res = await request(app)
            .post("/api/forum/topics/nonexistent/replies")
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "hi" });
        expect(res.status).toBe(404);
    });

    test("登录后成功创建回复返回 201", async () => {
        const res = await request(app)
            .post(`/api/forum/topics/${TEST_SLUG}/replies`)
            .set("Authorization", `Bearer ${otherToken}`)
            .send({ content: "第一条回复" });
        expect(res.status).toBe(201);
        expect(res.body.reply.content).toBe("第一条回复");
        expect(res.body.reply.user_id).toBeDefined();
    });

    test("回复后 reply_count 自增且按时间正序", async () => {
        // 再创建一条回复
        await request(app)
            .post(`/api/forum/topics/${TEST_SLUG}/replies`)
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "第二条回复" });

        const res = await request(app).get(`/api/forum/topics/${TEST_SLUG}`);
        expect(res.status).toBe(200);
        expect(res.body.topic.reply_count).toBeGreaterThanOrEqual(2);
        expect(res.body.replies.length).toBeGreaterThanOrEqual(2);
        // 验证按时间正序:第一条的 created_at <= 最后一条
        const first = res.body.replies[0];
        const last = res.body.replies[res.body.replies.length - 1];
        expect(new Date(first.created_at).getTime())
            .toBeLessThanOrEqual(new Date(last.created_at).getTime());
    });
});

describe("删除主题 DELETE /api/forum/topics/:slug", () => {
    test("未登录返回 401", async () => {
        const res = await request(app)
            .delete(`/api/forum/topics/${TEST_SLUG}`);
        expect(res.status).toBe(401);
    });

    test("非作者删除返回 403", async () => {
        const res = await request(app)
            .delete(`/api/forum/topics/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    test("作者成功删除返回 200", async () => {
        const res = await request(app)
            .delete(`/api/forum/topics/${TEST_SLUG}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test("删除后再次获取返回 404", async () => {
        const res = await request(app).get(`/api/forum/topics/${TEST_SLUG}`);
        expect(res.status).toBe(404);
    });

    test("删除不存在的主题返回 404", async () => {
        const res = await request(app)
            .delete("/api/forum/topics/nonexistent")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test("删除主题同时清理关联回复", async () => {
        // 创建一个带回复的主题
        await request(app)
            .post("/api/forum/topics")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "待删", slug: "to-delete", content: "c" });
        await request(app)
            .post("/api/forum/topics/to-delete/replies")
            .set("Authorization", `Bearer ${token}`)
            .send({ content: "reply" });

        // 删除前确认回复存在
        const before = await request(app).get("/api/forum/topics/to-delete");
        expect(before.body.replies.length).toBe(1);

        // 删除主题
        await request(app)
            .delete("/api/forum/topics/to-delete")
            .set("Authorization", `Bearer ${token}`);

        // 通过数据库确认回复被清理
        const { getDb } = require("../src/db");
        const db = getDb();
        const repliesLeft = db.forum_replies.filter(
            (r) => r.topic_id === before.body.topic.id
        );
        expect(repliesLeft.length).toBe(0);
    });
});
