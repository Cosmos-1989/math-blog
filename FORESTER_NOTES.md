# Forester 构建注意事项

本文档总结了使用 Forester 构建静态网站时的常见错误及解决方案。

## 1. 数学公式语法

### ❌ 禁止使用 `\[...\]` 显示数学公式
```tex
\[  \sum_{i=1}^n x_i  \]
```
**原因**：Forester 不支持 LaTeX 显示公式语法。

**✅ 解决方案**：使用行内公式语法 `#{$...$}`
```tex
#{ $\sum_{i=1}^n x_i$ }
```

### ❌ 避免在 `#{}` 内使用圆括号 `)`
```tex
#{[a,b)}  % 错误：圆括号导致解析错误
```

**✅ 解决方案**：
- 改用文字描述：半开区间 `[a,b)`
- 或将括号放在 `#{}` 外：
```tex
#{[a,b]} #{a<b} 的左闭右开区间
```

### ❌ 避免使用 `\!` 等特殊 LaTeX 间距命令
```tex
#{(\!a, b)}  % 错误
```

**✅ 解决方案**：直接使用普通括号
```tex
#{(a,b)}
```

### ❌ 避免在 `#{}` 内使用复杂的集合记号
```tex
#{\{-1,+1\}}  % 可能出错
```

**✅ 解决方案**：将复杂表达式放在 `#{}` 外
```tex
#{\{-1,1\}}  % 或使用文字描述
```

### ✅ 正确的数学公式写法
```tex
\p{序列空间 #{\ell^p} 是满足 #{ $\sum |x_n|^p < \infty$ } 的序列集合。}

\p{#{\mathbb{R}^n} 上的范数定义为
#{ $\|(x_1,\ldots,x_n)\| = \sqrt{|x_1|^2 + \cdots + |x_n|^2}$ }。}
```

## 2. 文件格式问题

### ✅ 保持文件末尾有正确的换行
```tex
...  % 最后一行
     % 空行（可选）
```

### ✅ 文件编码
- 确保使用 **UTF-8** 编码
- 不要使用特殊编码或混合编码

## 3. Forester 特定命令

### ⚠️ `\section` 和 `\subsection` 会产生警告
```tex
\section{章节标题}      % 警告：Unknown binding
\subsection{小节标题}   % 警告：Unknown binding
```

**说明**：这些命令可以正常使用，但会产生警告。它们会被渲染为普通标题。

### ✅ 推荐的结构命令
```tex
\title{页面标题}
\date{2025-03-09}
\taxon{Theorem/Definition/Example}
\author{作者}

\p{段落文本...}

\section{章节}

\subsection{小节}

\ul{
  \li{列表项 1}
  \li{列表项 2}
}

\ol{
  \li{有序列表 1}
  \li{有序列表 2}
}

\strong{粗体文本}

% 行内公式
#{ $e^{i\pi} + 1 = 0$ }

% 定义
\def\X#{\mathcal{X}}
```

## 4. 常见错误排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `syntax error, unexpected ")"` | 圆括号在 `#{}` 内 | 将括号移到外面 |
| `syntax error, unexpected "!"` | `\!` 等特殊命令 | 移除 `\!` |
| `syntax error, unexpected ""` | 文件末尾多余空行 | 检查并删除多余空行 |
| `unresolved_identifier` | 未知命令 | 使用标准 Forester 命令 |

## 5. 构建命令

```bash
# 进入项目目录
cd /path/to/forester2

# 激活 OCaml 环境
eval $(opam env)

# 构建网站
forester build forest.toml

# 查看输出（默认）
# output/math-blog/
```

## 6. 本地预览

```bash
cd output/math-blog
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 7. 实用技巧

1. **分步测试**：每次修改后立即运行 `forester build` 检查错误
2. **简化公式**：复杂公式分段写，避免嵌套 `#{}`
3. **查阅文档**：Forester 语法与标准 LaTeX 有差异，以本文档为准
4. **清理缓存**：遇到奇怪错误时，删除 `output/` 目录重新构建

---
更新时间：2026-03-24
