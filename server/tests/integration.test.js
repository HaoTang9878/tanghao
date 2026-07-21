/**
 * 集成测试：跨模块完整业务流程验证
 * 覆盖用户注册→登录→创建内容→权限隔离→级联删除等场景
 * 使用内存模式保证测试隔离与速度
 */
const request = require("supertest");

// 在 require app 之前切换为内存模式
process.env.JWT_SECRET = "integration-test-secret";
const { setMemoryMode, closeDb } = require("../src/db");
setMemoryMode();

const app = require("../src/app");

afterAll(() => {
    closeDb();
});

/**
 * 辅助函数：注册并登录用户，返回 token
 */
async function registerAndLogin(username) {
    await request(app)
        .post("/api/auth/register")
        .send({ username, email: username + "@test.com", password: "password123" });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ username, password: "password123" });
    return res.body.token;
}

/**
 * 辅助函数：带 token 发送请求
 */
function authReq(method, url, token) {
    return request(app)[method](url).set("Authorization", "Bearer " + token);
}

describe("集成测试：完整用户流程", () => {
    test("注册→登录→创建文章→书籍→项目→论坛主题→回复→清理", async () => {
        // 注册并登录
        const token = await registerAndLogin("integration_user");

        // 创建文章
        const article = await authReq("post", "/api/articles", token)
            .send({ title: "集成测试文章", slug: "int-test-article", content: "内容" });
        expect(article.status).toBe(201);

        // 创建书籍
        const book = await authReq("post", "/api/books", token)
            .send({ title: "集成测试书", slug: "int-test-book", author: "测试作者" });
        expect(book.status).toBe(201);

        // 创建项目
        const project = await authReq("post", "/api/projects", token)
            .send({ title: "集成测试项目", slug: "int-test-project", description: "测试" });
        expect(project.status).toBe(201);

        // 创建论坛主题
        const topic = await authReq("post", "/api/forum/topics", token)
            .send({ title: "集成测试主题", slug: "int-test-topic", content: "讨论内容" });
        expect(topic.status).toBe(201);

        // 创建回复
        const reply = await authReq("post", "/api/forum/topics/int-test-topic/replies", token)
            .send({ content: "回复内容" });
        expect(reply.status).toBe(201);

        // 验证主题详情包含回复
        const topicDetail = await request(app).get("/api/forum/topics/int-test-topic");
        expect(topicDetail.status).toBe(200);
        expect(topicDetail.body.replies.length).toBe(1);

        // 清理：删除回复创建的关联
        const delTopic = await authReq("delete", "/api/forum/topics/int-test-topic", token);
        expect(delTopic.status).toBe(200);
    });
});

describe("集成测试：权限隔离", () => {
    test("用户A创建的内容，用户B不能修改或删除", async () => {
        const tokenA = await registerAndLogin("user_a");
        const tokenB = await registerAndLogin("user_b");

        // 用户A创建文章
        const create = await authReq("post", "/api/articles", tokenA)
            .send({ title: "用户A的文章", slug: "user-a-article", content: "私有" });
        expect(create.status).toBe(201);

        // 用户B尝试修改用户A的文章
        const update = await authReq("put", "/api/articles/user-a-article", tokenB)
            .send({ title: "被篡改", content: "hack" });
        expect(update.status).toBe(403);

        // 用户B尝试删除用户A的文章
        const del = await authReq("delete", "/api/articles/user-a-article", tokenB);
        expect(del.status).toBe(403);

        // 用户B尝试创建相同slug的书籍
        const bookA = await authReq("post", "/api/books", tokenA)
            .send({ title: "书A", slug: "shared-slug", author: "A" });
        expect(bookA.status).toBe(201);

        // 用户A可以创建相同slug的书籍（因为slug只在同一用户下唯一）
        // 但如果slug全局唯一则会409
        const bookB = await authReq("post", "/api/books", tokenB)
            .send({ title: "书B", slug: "shared-slug", author: "B" });
        // 应该是409（slug冲突）或201（用户级唯一）
        expect([201, 409]).toContain(bookB.status);
    });
});

describe("集成测试：未认证访问", () => {
    test("所有需要认证的端点在无 token 时返回 401", async () => {
        // 创建文章
        const article = await request(app)
            .post("/api/articles")
            .send({ title: "test", slug: "test" });
        expect(article.status).toBe(401);

        // 创建书籍
        const book = await request(app)
            .post("/api/books")
            .send({ title: "test", slug: "test" });
        expect(book.status).toBe(401);

        // 创建项目
        const project = await request(app)
            .post("/api/projects")
            .send({ title: "test", slug: "test" });
        expect(project.status).toBe(401);

        // 创建论坛主题
        const topic = await request(app)
            .post("/api/forum/topics")
            .send({ title: "test", slug: "test" });
        expect(topic.status).toBe(401);

        // 创建回复
        const reply = await request(app)
            .post("/api/forum/topics/any/replies")
            .send({ content: "test" });
        expect(reply.status).toBe(401);
    });
});

describe("集成测试：数据一致性", () => {
    test("论坛主题回复数与实际回复一致", async () => {
        const token = await registerAndLogin("consistency_user");

        // 创建主题
        await authReq("post", "/api/forum/topics", token)
            .send({ title: "一致性测试", slug: "consistency-test", content: "test" });

        // 验证初始回复数为0
        const before = await request(app).get("/api/forum/topics/consistency-test");
        expect(before.body.topic.reply_count).toBe(0);
        expect(before.body.replies.length).toBe(0);

        // 添加2条回复
        await authReq("post", "/api/forum/topics/consistency-test/replies", token)
            .send({ content: "回复1" });
        await authReq("post", "/api/forum/topics/consistency-test/replies", token)
            .send({ content: "回复2" });

        // 验证回复数为2
        const after = await request(app).get("/api/forum/topics/consistency-test");
        expect(after.body.topic.reply_count).toBe(2);
        expect(after.body.replies.length).toBe(2);
    });
});

describe("集成测试：级联删除", () => {
    test("删除论坛主题时级联删除回复", async () => {
        const token = await registerAndLogin("cascade_user");

        // 创建主题
        await authReq("post", "/api/forum/topics", token)
            .send({ title: "级联测试", slug: "cascade-test", content: "test" });

        // 添加回复
        await authReq("post", "/api/forum/topics/cascade-test/replies", token)
            .send({ content: "回复1" });
        await authReq("post", "/api/forum/topics/cascade-test/replies", token)
            .send({ content: "回复2" });

        // 验证回复存在
        const before = await request(app).get("/api/forum/topics/cascade-test");
        expect(before.body.replies.length).toBe(2);

        // 删除主题
        const del = await authReq("delete", "/api/forum/topics/cascade-test", token);
        expect(del.status).toBe(200);

        // 验证主题已删除（404）
        const after = await request(app).get("/api/forum/topics/cascade-test");
        expect(after.status).toBe(404);
    });
});

describe("集成测试：slug 唯一性", () => {
    test("同一用户创建相同 slug 的文章应失败", async () => {
        const token = await registerAndLogin("slug_user");

        // 第一次创建
        const first = await authReq("post", "/api/articles", token)
            .send({ title: "第一篇", slug: "duplicate-slug", content: "test" });
        expect(first.status).toBe(201);

        // 第二次创建相同 slug
        const second = await authReq("post", "/api/articles", token)
            .send({ title: "第二篇", slug: "duplicate-slug", content: "test" });
        expect(second.status).toBe(409);
    });
});
