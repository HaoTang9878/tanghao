# 联系我

> 有想法、有问题、或想合作？欢迎留言 —— 期待与你的交流

<!-- 联系方式卡片：GitHub 与邮箱 -->
<div class="contact-cards">
    <div class="contact-card">
        <div class="contact-icon contact-icon-gh">GH</div>
        <div class="contact-info">
            <h3 class="contact-label">GitHub</h3>
            <a class="contact-value" href="https://github.com/HaoTang9878" target="_blank" rel="noopener">@HaoTang9878 ↗</a>
            <p class="contact-hint">代码仓库、Issue 与 PR 都在这里</p>
        </div>
    </div>
    <div class="contact-card">
        <div class="contact-icon contact-icon-mail">@</div>
        <div class="contact-info">
            <h3 class="contact-label">邮箱</h3>
            <a class="contact-value" href="mailto:bruce@brucetanghao.com">bruce@brucetanghao.com</a>
            <p class="contact-hint">正式合作或长文交流欢迎邮件</p>
        </div>
    </div>
    <div class="contact-card">
        <div class="contact-icon contact-icon-web">W</div>
        <div class="contact-info">
            <h3 class="contact-label">个人站点</h3>
            <a class="contact-value" href="https://brucetanghao.com" target="_blank" rel="noopener">brucetanghao.com ↗</a>
            <p class="contact-hint">作品集、笔记与思考的聚合地</p>
        </div>
    </div>
</div>

<!-- 留言表单区 -->
<div class="contact-form-wrap">
    <h3 class="contact-form-title">给我留言</h3>
    <p class="contact-form-desc">留言会以主题形式发布到讨论区，登录后可即时同步。</p>

    <form id="contact-form" class="contact-form" novalidate>
        <div class="contact-field">
            <label class="contact-field-label" for="contact-name">姓名</label>
            <input class="contact-input" type="text" id="contact-name" name="name"
                   placeholder="你的称呼" required maxlength="40">
        </div>
        <div class="contact-field">
            <label class="contact-field-label" for="contact-email">邮箱</label>
            <input class="contact-input" type="email" id="contact-email" name="email"
                   placeholder="便于我回复你" required maxlength="80">
        </div>
        <div class="contact-field">
            <label class="contact-field-label" for="contact-message">留言内容</label>
            <textarea class="contact-textarea" id="contact-message" name="message"
                      placeholder="想说什么都可以写在这里..." required maxlength="1000" rows="5"></textarea>
        </div>

        <!-- 提交按钮：含 loading 文案切换 -->
        <button class="contact-submit" id="contact-submit" type="submit">
            <span class="contact-submit-text">发送留言</span>
        </button>

        <!-- 提示信息：成功 / 失败 / 未登录 -->
        <p class="contact-feedback" id="contact-feedback"></p>
    </form>
</div>

<style>
/* ====== 联系方式卡片网格 ====== */
.contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin: 16px 0 32px;
}
.contact-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #fff;
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.contact-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
/* 图标占位：不同分类用不同渐变 */
.contact-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
}
.contact-icon-gh { background: linear-gradient(135deg, #1976d2, #0d47a1); }
.contact-icon-mail { background: linear-gradient(135deg, #42b983, #2c7a52); }
.contact-icon-web { background: linear-gradient(135deg, #f57c00, #c25700); }

.contact-info { min-width: 0; }
.contact-label {
    margin: 0 0 4px;
    font-size: 13px;
    color: #999;
}
.contact-value {
    font-size: 15px;
    color: var(--bt-theme-color, #42b983);
    text-decoration: none;
    word-break: break-all;
}
.contact-value:hover { text-decoration: underline; }
.contact-hint {
    margin: 4px 0 0;
    font-size: 12px;
    color: #999;
}

/* ====== 留言表单 ====== */
.contact-form-wrap {
    background: #fff;
    border-radius: 12px;
    padding: 24px 28px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    max-width: 640px;
}
.contact-form-title {
    margin: 0 0 6px;
    font-size: 18px;
    color: var(--bt-text-color, #333);
}
.contact-form-desc {
    margin: 0 0 18px;
    font-size: 13px;
    color: #999;
}
.contact-field {
    margin-bottom: 16px;
}
.contact-field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--bt-text-color, #555);
}
.contact-input,
.contact-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid var(--bt-border-color, #ddd);
    border-radius: 6px;
    background: var(--bt-content-bg, #fff);
    color: var(--bt-text-color, #333);
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s ease;
}
.contact-input:focus,
.contact-textarea:focus {
    outline: none;
    border-color: var(--bt-theme-color, #42b983);
}
.contact-textarea {
    resize: vertical;
    min-height: 100px;
}
/* 提交按钮 */
.contact-submit {
    padding: 10px 24px;
    background: var(--bt-theme-color, #42b983);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(66,185,131,0.3);
    transition: background 0.2s ease, transform 0.1s ease;
}
.contact-submit:hover { background: #369870; }
.contact-submit:active { transform: scale(0.97); }
.contact-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
/* 反馈提示 */
.contact-feedback {
    margin: 14px 0 0;
    font-size: 13px;
    min-height: 18px;
}
.contact-feedback.is-success { color: #42b983; }
.contact-feedback.is-error { color: #dc3545; }

/* ====== 暗色模式适配 ====== */
body.bt-dark-mode .contact-card,
body.bt-dark-mode .contact-form-wrap {
    background: rgba(30, 35, 56, 0.55);
    border: 1px solid var(--bt-border-color, #2a2a4a);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
body.bt-dark-mode .contact-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
}
body.bt-dark-mode .contact-input,
body.bt-dark-mode .contact-textarea {
    background: rgba(20, 24, 40, 0.7);
}

/* ====== 响应式：移动端缩小内边距 ====== */
@media (max-width: 768px) {
    .contact-form-wrap {
        padding: 18px 16px;
    }
}
</style>

<script>
// 留言表单提交逻辑：将留言作为主题发布到讨论区
(function () {
    var form = document.getElementById("contact-form");
    var submitBtn = document.getElementById("contact-submit");
    var submitText = submitBtn.querySelector(".contact-submit-text");
    var feedback = document.getElementById("contact-feedback");

    /**
     * 显示反馈信息
     * @param {string} msg - 提示文案
     * @param {string} type - success 或 error
     */
    function showFeedback(msg, type) {
        feedback.textContent = msg;
        feedback.className = "contact-feedback " + (type === "success" ? "is-success" : "is-error");
    }

    /**
     * 由姓名与邮箱生成 slug（保证唯一性的简易策略：加时间戳）
     * @param {string} name - 留言人姓名
     * @returns {string} slug
     */
    function buildSlug(name) {
        var safe = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 16) || "guest";
        return "msg-" + safe + "-" + Date.now();
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var name = document.getElementById("contact-name").value.trim();
        var email = document.getElementById("contact-email").value.trim();
        var message = document.getElementById("contact-message").value.trim();

        // 前端必填校验
        if (!name || !email || !message) {
            showFeedback("请完整填写姓名、邮箱与留言内容", "error");
            return;
        }

        // 读取登录令牌：未登录则提示先登录
        var token = localStorage.getItem("brucetanghao_token");
        if (!token) {
            showFeedback("请先登录后再留言，即将跳转登录页...", "error");
            setTimeout(function () { location.href = "#/login"; }, 1500);
            return;
        }

        // 进入 loading 状态，禁用按钮防重复提交
        submitBtn.disabled = true;
        submitText.textContent = "发送中...";

        // 组装主题数据：留言内容拼入邮箱与正文
        var payload = {
            title: "留言来自 " + name,
            slug: buildSlug(name),
            content: "邮箱：" + email + "\n\n" + message
        };

        fetch("/api/forum/topics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(payload)
        })
        .then(function (res) {
            // 解析响应体，统一处理非 2xx 错误
            return res.json().then(function (data) {
                return { ok: res.ok, status: res.status, data: data };
            });
        })
        .then(function (result) {
            if (result.ok) {
                showFeedback("留言发送成功！感谢你的反馈～", "success");
                form.reset();
            } else {
                // 401 令牌过期：引导重新登录
                if (result.status === 401) {
                    showFeedback("登录已过期，请重新登录", "error");
                    setTimeout(function () { location.href = "#/login"; }, 1500);
                } else {
                    showFeedback("发送失败：" + (result.data.error || "未知错误"), "error");
                }
            }
        })
        .catch(function (err) {
            // 网络或服务异常兜底
            console.error("留言提交异常：", err);
            showFeedback("网络异常，请稍后重试", "error");
        })
        .finally(function () {
            // 恢复按钮状态
            submitBtn.disabled = false;
            submitText.textContent = "发送留言";
        });
    });
})();
</script>
