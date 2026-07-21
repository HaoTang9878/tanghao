/**
 * 数据库模块与中间件补充测试
 * 覆盖文件模式、内存模式切换、authOptional 中间件
 */
const request = require("supertest");
const path = require("path");
const fs = require("fs");

process.env.JWT_SECRET = "test-secret";
const { setMemoryMode, closeDb, initDb, getDb, writeDb, DB_PATH } = require("../src/db");

afterEach(() => {
    closeDb();
});

describe("数据库模块", () => {
    test("内存模式下 initDb 返回空数据", () => {
        setMemoryMode();
        const db = initDb();
        expect(db.users).toEqual([]);
        expect(db.articles).toEqual([]);
        expect(db.nextUserId).toBe(1);
    });

    test("内存模式下 writeDb 为空操作(不报错)", () => {
        setMemoryMode();
        initDb();
        expect(() => writeDb()).not.toThrow();
    });

    test("closeDb 后重新 initDb 可重置", () => {
        setMemoryMode();
        let db = initDb();
        db.users.push({ id: 1, username: "x" });
        closeDb();
        setMemoryMode();
        db = initDb();
        expect(db.users).toEqual([]);
    });
});

describe("authOptional 中间件", () => {
    const express = require("express");
    const { authOptional } = require("../src/middleware/auth");

    function makeApp() {
        setMemoryMode();
        const app = express();
        app.use(express.json());
        app.get("/test", authOptional, (req, res) => {
            res.json({ user: req.user || null });
        });
        return app;
    }

    test("无 token 时正常通过,user 为 null", async () => {
        const res = await request(makeApp()).get("/test");
        expect(res.status).toBe(200);
        expect(res.body.user).toBeNull();
    });

    test("带有效 token 时解析用户", async () => {
        const { signToken } = require("../src/middleware/auth");
        const token = signToken({ id: 1, username: "test" });
        const res = await request(makeApp())
            .get("/test")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.username).toBe("test");
    });

    test("带无效 token 时静默忽略,user 为 null", async () => {
        const res = await request(makeApp())
            .get("/test")
            .set("Authorization", "Bearer invalid.token");
        expect(res.status).toBe(200);
        expect(res.body.user).toBeNull();
    });
});
