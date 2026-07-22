# 编程学习笔记

> 学习、实践、记录 —— 把踩过的坑沉淀成可复用的经验

这里收录我在编程学习过程中的详细笔记，涵盖 TypeScript、Python 与 Git 的核心知识点。每段笔记都来自真实编码场景，力求不止于"知道"，更要"用对"。

## TypeScript 学习笔记

TypeScript 的核心价值在于静态类型系统：它在编译期捕获错误，让重构更有底气。下面按类型系统、泛型、工具类型三个层次整理实战要点。

### 类型系统：结构化类型与窄化

TypeScript 采用结构化类型（Structural Typing），判断兼容性看"形状"而非"名义"。这意味着只要字段匹配，两个不同的接口即可互相赋值。理解这一点，能解释很多"为什么 TS 不报错"的疑惑。

```typescript
// 结构化类型：只要形状一致即可赋值，与接口名无关
interface Point2D { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const a: Point2D = { x: 1, y: 2 };
const b: Coordinate = a; // 合法：结构一致即可互相赋值

// 类型守卫（Type Guard）实现窄化，让分支内类型更精确
function format(value: string | number): string {
    if (typeof value === "number") {
        // 此分支内 value 被窄化为 number
        return value.toFixed(2);
    }
    // 这里 value 已窄化为 string
    return value.trim();
}
```

类型守卫配合 `in`、`typeof`、`instanceof` 能在分支内自动收窄类型，避免强制断言，是写出安全代码的关键手法。

### 泛型：参数化类型与约束

泛型让函数与类可以"延迟指定类型"，复用同一段逻辑于多种类型。关键技巧是加约束（`extends`）来限定类型必须具备的能力。

```typescript
// 泛型函数：延迟指定类型，保持输入输出类型一致
function first<T>(arr: T[]): T | undefined {
    return arr[0];
}
const n = first([1, 2, 3]);        // 推断为 number
const s = first(["a", "b"]);       // 推断为 string

// 泛型约束：要求 T 必须有 length 属性
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length;
}
getLength("hello");     // 合法：字符串有 length
getLength([1, 2, 3]);   // 合法：数组有 length
// getLength(123);      // 报错：number 没有 length
```

### 工具类型：Partial / Pick / Omit / Record

TS 内置的工具类型能从已有类型派生新类型，避免重复定义。它们本质是类型层面的"函数"。

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

// Partial：所有字段变可选，常用于更新接口入参
type UserUpdate = Partial<User>;

// Pick：挑选部分字段组成新类型
type UserBrief = Pick<User, "id" | "name">;

// Omit：排除部分字段
type PublicUser = Omit<User, "id" | "email">;

// Record：构造键值映射类型
type RolePerm = Record<string, boolean>;
```

实战中 `Partial<T>` 配合更新接口、`Omit<T, K>` 做对外脱敏，是用得最多的两个组合。

## Python 进阶笔记

### 装饰器：函数增强的优雅方式

装饰器本质是"接收函数返回函数"的高阶函数。理解闭包与执行时机是关键：装饰器在定义时就被执行，而非调用时。

```python
import functools
import time

def timer(func):
    """计时装饰器：记录函数执行耗时"""
    @functools.wraps(func)  # 保留原函数的元信息（名称、文档）
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[{func.__name__}] 耗时 {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_task(n):
    """模拟耗时计算"""
    return sum(i * i for i in range(n))

slow_task(100000)
# 输出: [slow_task] 耗时 0.0052s
```

`functools.wraps` 很容易被忽略却很重要：不写它，被装饰函数的 `__name__`、`__doc__` 都会被 wrapper 覆盖，导致调试与文档生成混乱。

### asyncio：协程与事件循环

asyncio 用单线程事件循环实现并发，适合 IO 密集型任务。核心心智模型：`await` 把控制权交还事件循环，让其他协程有机会运行。

```python
import asyncio

async def fetch_data(url, delay=1):
    """模拟异步请求：await 期间释放控制权"""
    await asyncio.sleep(delay)
    return f"来自 {url} 的数据"

async def main():
    # gather 并发调度多个协程，总耗时约等于最慢的一个
    urls = ["url-a", "url-b", "url-c"]
    tasks = [fetch_data(u, delay=1) for u in urls]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())
# 串行需 3 秒，并发约 1 秒
```

需要注意：asyncio 不适合 CPU 密集型任务，计算会阻塞事件循环。此时应配合 `run_in_executor` 把重计算丢给线程池。

### 类型提示：typing 与运行时校验

类型提示让 Python 兼具动态灵活与静态可读。注意：默认情况下类型提示不参与运行时检查，需要 mypy 静态分析。

```python
from typing import TypedDict

class UserInfo(TypedDict):
    """用 TypedDict 描述字典的精确结构"""
    name: str
    age: int
    email: str

def greet(user: UserInfo) -> str:
    return f"你好，{user['name']}（{user['age']}岁）"

greet({"name": "Bruce", "age": 24, "email": "bruce@brucetanghao.com"})
```

## Git 实用技巧

### rebase：整理提交历史的利器

交互式 rebase 可以压缩、重排、修改历史提交，保持线性整洁的历史。

```bash
# 交互式整理最近 3 次提交：合并、改写、调整顺序
git rebase -i HEAD~3
# 常用命令：pick 保留，squash 合并到上一个，reword 改信息

# 变基到目标分支，使历史线性化（先 fetch 最新再操作）
git fetch origin
git rebase origin/main
```

### cherry-pick：精准搬运单个提交

当只需把某个 commit 的改动应用到当前分支（而非整个分支合并），cherry-pick 最合适。

```bash
# 把指定 commit 的改动应用到当前分支
git cherry-pick <commit-hash>

# 多个提交一起搬运
git cherry-pick <hash-a> <hash-b>
```

### reflog：找回"丢失"的提交

reflog 记录 HEAD 的所有移动，即使是已 reset 的提交也能找回——这是 Git 的后悔药。

```bash
# 查看 HEAD 移动历史
git reflog
# 找到误删提交的 hash 后，硬性恢复
git reset --hard <commit-hash>
```

### bisect：二分定位引入 Bug 的提交

当回归问题出现却不知是哪次提交引入时，bisect 用二分法快速锁定元凶。

```bash
# 启动二分查找：标记好坏版本
git bisect start
git bisect bad          # 当前版本有 bug
git bisect good <hash>  # 标记一个已知正常的版本
# Git 自动切到中间提交，测试后继续标记
git bisect good         # 或 git bisect bad
# 定位到元凶后结束
git bisect reset
```

---

> 持续学习，持续记录，持续成长。
