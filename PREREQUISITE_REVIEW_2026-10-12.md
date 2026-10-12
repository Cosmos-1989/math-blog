# 全站前置知识核查

核查时间为 2026 年 10 月 12 日至 13 日。范围为 `trees/` 中的全部页面，起始版本有 3,050 页。数学正文按逻辑、代数、范畴与拓扑、合成高阶结构、几何与数论、分析与离散数学分工阅读，最后统一检查交界处的概念、重复定义及前置关系。

## 最终范围

| 项目 | 数量 |
| --- | ---: |
| 当前页面总数 | 3,138 |
| 数学正文及提纲页 | 3,072 |
| 纳入全文阅读记录的页面（含 20 个参考文献页） | 3,092 |
| 修改的原有词条 | 1,774 |
| 新增原子词条 | 88 |
| 本轮逐页修订及依赖判断记录 | 1,916 |
| 术语匹配规则 | 548 |

全部数学正文及提纲页都有全文阅读记录。其余 46 页为 45 个参考文献页和 1 个作者页，已参与全站结构扫描。新增及修改的词条均有对应修订记录，未删除原有词条。

## 阅读与修改记录

- 总记录为 `research/prerequisite-review-2026-10-12.json`，每页分别记录术语扫描、全文阅读和本轮修订状态。
- 分科记录为 `research/prerequisite-review-2026-10-12-*.json`，包含实际阅读的 ID、修改理由、术语判断和待展开事项。
- `research/site-evergreen-audit.json` 保存当前前置关系；`research/prerequisite-required-links.json` 保存本轮确认的正文链接及源码摘要值。
- 普通关联链接可以指向应用、反例或后续定理。只有理解本页所需的直接前提进入前置关系表，专题导航页不作定义前置。
- 保留原页面 ID、学科入口和研究专题的顺序。没有删除原有知识点，也没有将参考文献或作者页计作数学正文。

## 主要补充

### 代数群与线性代数

`0BJB` 的代数闭域、约化群、Lie 代数、忠实代数表示、幂零元、对角环面、微分与余字符都有正文链接。新增页进一步解释双数、Zariski 切空间、代数群的 Lie 代数、Jordan 分解、对称幂及线性算子的迹。

忠实代数表示采用闭浸入条件，保留正特征下仅检验域值点单射不足的例子。代数群 Lie 代数中的幂零性通过忠实表示定义，另说明有中心时不能以伴随算子幂零代替。Jacobson–Morozov 定理的存在性及积分结论仍按来源引用。

多对象增广 DG 代数的 Koszul 对偶定义与严格增广模型的构造分别放在 `0F14`、`0F15`。后者逐次核对乘法、微分和上同调，原来的导出收缩代数条目分别引用这两个知识点。

### 范畴、拓扑与逻辑

分别建立预加性范畴、加性范畴、核与余核、一般阿贝尔范畴，避免将一般定义误连到域上线性版本。补充拓扑嵌入、一致连续、曲面与三角剖分、Hilbert 张量积和纯态纠缠等定义；重复的一致连续词条已合并。

合成高阶结构补充闩锁对象与 Ken Brown 引理的适用形式。低阶有向单价性、高阶比较以及普通单价性分别使用相应页面。逻辑部分补充代数闭包、Boolean 理想与商、extender 及其超幂入口。

### 数论、几何与分析

数论内容补充局部域、阿代尔环及阿代尔群、自守形式与自守表示、局部成分、球 Hecke 代数、有限处 Satake 参数、无穷处 Harish-Chandra 参数。两处参数均给出归一化，避免只用“联合特征值”代替定义。

晶体局部条件从 p 进复数域开始，经倾斜整数环、Witt 向量、Fontaine 映射、`A_cris` 和 `B_cris` 逐步说明，再定义晶体表示与幺幂一次上同调的局部条件。

几何部分补充横截性、余切丛、层上同调、杯积、Künneth 公式与 Serre 对偶的适用版本。Floer 条目接入 Banach 空间、Fréchet 微分、Fredholm 算子及正则值；另补光滑主丛、Spin 结构与拉格朗日整数分次。

## 验证办法

术语扫描使用定义标题和经人工核对的别名。扫描结果需要结合上下文判断，例如“预加性范畴”中的“加性范畴”只是词尾命中；光滑线丛也不能机械链接到代数几何的局部自由层定义。数学公式、来源元数据和 TeX 图形不作为正文术语扫描的对象。

检查还覆盖正文链接缺失、链接指向非原子导航页、已确认前置关系丢失、源码摘要值过期、前置环、不可达页面，以及误放进公式内部的 Markdown 链接。已确认的术语判断绑定对应源码，后续修改需要重新核对。

更新分科记录后，最后运行本轮同步，避免旧同步覆盖新的前置关系。

```sh
node scripts/sync-prerequisite-review.mjs
node scripts/test-note-prerequisites.mjs
node scripts/test-subject-navigation.mjs
node scripts/check-note-prerequisites.mjs --report /tmp/note-prerequisites.json
node scripts/check-note-editorial.mjs --strict-format
node scripts/check-site-notes.mjs --source-only
node scripts/check-subject-navigation.mjs
node scripts/check-topic-narratives.mjs
node scripts/check-riehl-notes.mjs
node scripts/check-geometry-notes.mjs
node scripts/check-number-theory-notes.mjs
node scripts/apply-theme.mjs
forester build forest.toml
node scripts/check-site-domain.mjs
node scripts/check-reading-ui.mjs
node scripts/check-site-notes.mjs --katex /path/to/katex/dist/katex.js
node scripts/check-logic-notes.mjs --katex /path/to/katex/dist/katex.js
node scripts/check-algebra-notes.mjs
git diff --check
```

## 最终验证结果

- Forester 构建成功，3,138 页全部可从站内入口到达；正文链接、前置关系与环检查均无错误或警告。
- KaTeX 检查通过 31,422 个公式和 46 个交换图。
- 548 条术语规则产生 96 项正文候选和 74 项链接目标候选，均有针对当前源码的人工判断记录；本轮 1,916 页的必要链接与源码摘要值检查通过。
- 前置知识工具的 21 项回归测试、学科导航的 5 项回归测试通过；20 个学科入口及 32 个研究综述的结构检查通过。
- 公开域名、根路径及搜索索引检查覆盖 3,138 页。生成主题与 7 页代表性 XSL 转换通过。
- 独立浏览器完成原有 7 页在 1,440、390、320 像素视口下的界面检查；另对 11 个本轮相关页面完成桌面、手机共 22 次检查，未出现页面横向溢出或脚本错误，并实际点击 `0BJB` 的忠实代数表示链接进入 `0F02`。
- `git diff --check` 通过。上述结构与渲染检查不代替数学证明的逐项核验；尚未展开的证明输入列于下节。

## 仍需展开的内容

核查和补链不等同于将研究报告所引用的定理全部重新证明。下列内容继续使用明确的文献输入。

- `01AC` 中局部同态下的深度比较、深度与维数关系、正则局部环的同调刻画。
- `015D` 中范畴半单性的最后一步；Jacobson 根基及有限维代数的半单商已经独立陈述。
- `0BL9`、`0BLA` 中 Floer 方程的具体 Sobolev/Banach 实现、线性化的 Fredholm 性、模空间紧化与粘合。
- `0BLP` 中一般 Liouville 扇区边界的完整解析条件及最大值原理。

部分“香蕉空间”术语页面本次未能在线核验，具体访问记录保留在分科记录中。数学定义另据作者讲义、Stacks Project 及原始论文核对，沿用项目已有中文术语。

## 浏览器与发布

使用独立无头浏览器检查桌面、手机和窄屏布局，以及搜索、目录、折叠和交换图；另检查 `0BJB`、`0F02`、`0F0I`、`0F4B`、`0F5M`、`0F6A`、`0F14`、`0F15`、`0F5Q`、`0F5R`、`0F5T` 的数学渲染，并实际点击 `0BJB` 的忠实代数表示链接。

本机 Chrome 显示 XSLT 即将停用的提示，当前 XML 页面仍能渲染。这是现有发布形式的兼容性风险，宜另行迁移为构建时生成静态 HTML。本轮没有隐藏该提示或更改发布架构。

上述内容核查完成时，修改仅在本地，尚未提交或推送 GitHub。2026 年 10 月 13 日按用户要求进入正式发布；线上更新以对应 GitHub Pages 部署成功及网页核验结果为准。
