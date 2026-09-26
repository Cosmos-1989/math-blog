# 合成高阶结构讲义整合记录

## 范围与作者

2026-09-25 整合博客作者提供的《从同伦类型到合成高阶范畴：空间、路径归纳、Yoneda 引理与有向单价性》。讲义含 22 章、2 篇附录、19 条参考文献。它是作者围绕 Emily Riehl 报告撰写的系统讲义，不是把讲义归为 Riehl 的著作。

报告题为 *Synthetic Perspectives on Higher Structures*；Proceedings 论文题为 *Synthetic Perspectives on Spaces and Categories*。论文来源、讲义来源分别为 `0211` 和 `0210`。

## 内容组织

- 专题入口 `0200` 直接进入路径、单价性、合成 Yoneda、有向单价性与带结构空间；`020P` 提供完整学习路线。
- 拓扑导航 `0066` 与范畴论入口 `001F` 均链接该专题，原学科导航及历史条目地址保留。
- 新增 657 个页面：603 个知识条目、34 个叙事或索引页、20 个来源页。一个定理与直接证明可以同页，独立概念、例子或对应定理分别建页。
- 函数与复合复用 `00G0`、`00G1`，补充逐点外延原则；未发布草稿 `0300`、`0301` 不再建立重复页面，`0302` 专注集合函数的纤维。
- 复用既有范畴、群、群作用、自然变换、有限积、拓扑空间、层、单纯集合等定义；在规范页补入缺失的证明或约定。普通集合、同伦类型与有向类型不因术语相同而合并。
- 拆分期间的重复草稿 `041F`、`063I` 分别撤回，使用 `034J`、`0342`。它们从未发布；生成目录中的旧草稿不属于源内容。
- 右作用和等变映射统一定义在 `00BI`；`05G9` 只保留作用函数反转乘法顺序的独立计算。
- 交换图沿用 LaTeX/TikZ 到 SVG 的 Sterling 流程；不以截图代替可维护的图源。

## 来源与覆盖核对

`research/sources/riehl-synthetic-lectures/` 完整保留原始 28 个文件，SHA-256 和大小记录于 `research/riehl-source-manifest.json`。`standalone.tex` 是同一讲义的汇编，不作为第二份内容重复导入。

24 个章节文件共含 955 个形式单元，包括定义、例子、引理、命题、定理、注记及证明。每个单元均映射到新条目或已复用的规范条目。映射在 `research/riehl-*.json` 中逐源行记录；正文之外的术语表、公式索引与叙事由相应组单独核对。

各组记录保存局部语境补全、去重、来源纠错、必要前置与外部输入；父级集成决定在 `research/riehl-integration.json`。共同审查记录合并入 `research/site-evergreen-audit.json`，不替换此前逻辑、代数及其他学科的范围。

覆盖映射是防遗漏的编辑核对，不是数学正确性的形式化证明，也不能仅凭文件数证明每一条笔记都达到了最佳原子化。

## 证明边界

保留具体计算与原有论证，包括圆周 encode/decode、拟逆修正、依赖和路径、挠子分类、箭头归纳与结构同态的计算。源材料中压缩的组合论证仍注明为证明概要。

Quillen 与 Reedy 模型结构、严格单价宇宙存在、内部形状比较、参数化左纤维化图表比较及相关封闭性是明确引用的外部输入；不宣称这里展开了它们的一般模型论证明。宇宙大小及选择条件单独说明，路径连接与函数复合方向不混用。

补齐语义前置时展开了反射局部化、滤过高阶范畴、可达性与强不可达基数。定义参照讲义所列 *Higher Topos Theory*，紧性的定义另核对 [Kerodon 064F](https://kerodon.net/tag/064F)。

## 复验

```sh
node scripts/sync-riehl-audit.mjs
node scripts/check-riehl-notes.mjs
node scripts/check-site-notes.mjs --source-only
forester build forest.toml
node scripts/check-site-notes.mjs --katex /path/to/katex/dist/katex.js
node scripts/check-subject-navigation.mjs
node scripts/check-logic-notes.mjs
node scripts/check-algebra-notes.mjs
node scripts/check-reading-ui.mjs
```

`riehl-*.mjs` 与 `riehl-*.py` 中的导入生成器只是一次性拆分辅助，不能作为日常构建命令；定稿 `.tree` 包含后续逐页修订，盲目重跑会覆盖它们。检查器和审计合并脚本不重写数学正文。

全站构建、公式解析、SVG 存在性、旧学科清单与依赖检查已通过。本地服务使用端口 8083；专题地址为 `http://localhost:8083/math-blog/0200/index.xml`。内置浏览器自动化对 XML 导航返回客户端拦截，故未把这次自动化浏览器预览记为通过；HTTP 返回与静态 XSL 转换另行检查。本次没有提交或推送 GitHub。
