/**
 * 认证路由模块
 * 提供注册、登录、登出、获取当前用户信息的 REST API
 * 所有路由前缀:/api/auth
 */
const express = require("express");
const { body, validationResult } = require("express-validator");
const { authRequired, signToken } = require("../middleware/auth");
const User = require("../db/user");

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 * 入参:username, email, password
 */
router.post(
    "/register",
    [
        body("username")
            .trim()
            .isLength({ min: 3, max: 32 })
            .withMessage("用户名长度需为 3-32 个字符"),
        body("email").isEmail().withMessage("邮箱格式不合法"),
        body("password")
            .isLength({ min: 6, max: 64 })
            .withMessage("密码长度需为 6-64 个字符"),
    ],
    (req, res) => {
        // 参数校验
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, password } = req.body;

        // 唯一性校验:用户名
        if (User.findByUsername(username)) {
            return res.status(409).json({ error: "用户名已被占用" });
        }
        // 唯一性校验:邮箱
        if (User.findByEmail(email)) {
            return res.status(409).json({ error: "邮箱已被注册" });
        }

        // 创建用户并签发 token
        const user = User.createUser({ username, email, password });
        const token = signToken({ id: user.id, username: user.username });
        return res.status(201).json({ user, token });
    }
);

/**
 * POST /api/auth/login
 * 用户登录
 * 入参:username(或 email), password
 */
router.post(
    "/login",
    [
        body("username").trim().notEmpty().withMessage("用户名不能为空"),
        body("password").notEmpty().withMessage("密码不能为空"),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, password } = req.body;

        // 支持用户名或邮箱登录
        const user = User.findByUsername(username) || User.findByEmail(username);
        if (!user || !User.verifyPassword(password, user.password_hash)) {
            return res.status(401).json({ error: "用户名或密码错误" });
        }

        const token = signToken({ id: user.id, username: user.username });
        // 返回不含密码的用户信息
        const safeUser = User.sanitize(user);
        return res.json({ user: safeUser, token });
    }
);

/**
 * POST /api/auth/logout
 * 登出(无状态 JWT,前端删除 token 即可)
 */
router.post("/logout", authRequired, (req, res) => {
    // JWT 无状态:后端无需记录,客户端清除 token 即完成登出
    return res.json({ message: "已登出" });
});

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
router.get("/me", authRequired, (req, res) => {
    const user = User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: "用户不存在" });
    }
    return res.json({ user });
});

module.exports = router;
