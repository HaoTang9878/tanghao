# 编程学习笔记

这里收录我在编程学习过程中的详细笔记。

## TypeScript 类型系统详解

TypeScript 的类型系统是其最强大的特性之一。

### 基础类型

```typescript
// 基础类型声明
let isDone: boolean = false;
let count: number = 10;
let name: string = "brucetanghao";
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["hello", 10];
```

### 接口与类型别名

```typescript
// 接口定义对象的形状
interface Person {
    name: string;
    age: number;
    readonly id: number;
    greet?(): void;
}

// 类型别名
type ID = string | number;
```

### 泛型

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

// 泛型约束
interface Lengthwise {
    length: number;
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}
```

## Python 异步编程实践

Python 的 asyncio 是编写并发代码的强大工具。

### 基础协程

```python
import asyncio

async def hello():
    """简单的协程示例"""
    print("Hello")
    await asyncio.sleep(1)
    print("World")

asyncio.run(hello())
```

### 并发执行

```python
async def fetch_data(url):
    """模拟异步获取数据"""
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    """并发获取多个 URL 的数据"""
    urls = ["url1", "url2", "url3"]
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())
```

## Git 高级用法

### 交互式 rebase

```bash
# 修改最近 3 次提交
git rebase -i HEAD~3
```

### cherry-pick

```bash
# 将某个 commit 的修改应用到当前分支
git cherry-pick <commit-hash>
```

### stash 暂存

```bash
# 暂存当前修改
git stash

# 查看暂存列表
git stash list

# 恢复最近的暂存
git stash pop
```

---

> 持续学习，持续记录，持续成长。
