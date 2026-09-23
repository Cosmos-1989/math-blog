# ICM2026 代数报告来源与整合记录

日期：2026-09-23。本文件是维护记录，不进入博客知识正文。

## 范围与来源

以[官方报告人名单](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)中主分组或明确交叉分组包含 Section 2 的记录为范围：共 **15 位报告人、12 场报告**。三场联合报告各计一次；Rachel Greenfeld 的跨分组报告复用已有逻辑专题，不重复建页。

官方页面的初始可见列表不能代表全部名单。`scripts/extract-icm-algebra-roster.mjs` 从公开页面内嵌的 305 条报告人记录提取分组和联合报告信息；结果及原始页面 SHA-256 保存在 `research/icm2026-algebra-roster.json`，不保存邮箱等无关字段。

正式出处为 SIAM 的 *Proceedings of the International Congress of Mathematicians 2026, Volume 3: Invited Lectures (Sections 1–4)*。以下 DOI 均为对应报告本身，不以作者旧论文代替本届报告。arXiv 版本同时核对题名、作者与正式出版信息。

| 报告人 | 正式报告 | DOI / 已读 arXiv 版本 | 页码 | 导读 / 文献 |
| --- | --- | --- | --- | --- |
| Pramod N. Achar、Simon Riche | Tilting Modules for Reductive Algebraic Groups: Characters and Support Varieties | [10.1137/25M1805242](https://epubs.siam.org/doi/10.1137/25M1805242)；2511.05063v1 | 133–152 | 0181 / 0183 |
| Iván Angiono | Pointed Hopf Algebras Revisited, with a View from Tensor Categories | [10.1137/25M180439X](https://epubs.siam.org/doi/10.1137/25M180439X)；2510.03124v1 | 153–171 | 0140 / 0141 |
| Nir Avni、Chen Meiri | Conjugacy Width in Higher-Rank Arithmetic Groups | [10.1137/25M1804352](https://epubs.siam.org/doi/10.1137/25M1804352) | 172–186 | 0160 / 0161 |
| Tom Braden、Nicholas Proudfoot | Intersection Cohomology Without Spaces | [10.1137/25M1806053](https://epubs.siam.org/doi/10.1137/25M1806053)；2510.09488v2 | 187–207 | 01C0 / 01C1 |
| Srikanth B. Iyengar | Commutative Algebra Inspired by Modularity Lifting | [10.1137/25M1803127](https://epubs.siam.org/doi/10.1137/25M1803127)；2510.11875v2 | 208–218 | 01A0 / 01A1 |
| Gabriel Navarro | Character Correspondents for Finite Groups | [10.1137/25M1791949](https://epubs.siam.org/doi/10.1137/25M1791949) | 219–228 | 016Y / 016Z |
| Konstanze Rietsch | Totally Positive Toeplitz Matrices: Classical and Modern | [10.1137/25M1806727](https://epubs.siam.org/doi/10.1137/25M1806727)；2509.25163v3 | 229–249 | 01C2 / 01C3 |
| Sibylle Schroll | On Geometric Models in Representation Theory | [10.1137/25M1810647](https://epubs.siam.org/doi/10.1137/25M1810647)；2601.14396v1 | 250–271 | 0182 / 0184 |
| Andrew Snowden | Oligomorphic Groups and Tensor Categories: A Summary | [10.1137/25M1806223](https://epubs.siam.org/doi/10.1137/25M1806223) | 272–292 | 014Z / 0150 |
| Anastasia Stavrova | Elementary Subgroups in Isotropic Reductive Groups | [10.1137/25M1806399](https://epubs.siam.org/doi/10.1137/25M1806399) | 293–304 | 01E0 / 01E1 |
| Michael Wemyss | The Taming of 3-fold Flops | [10.1137/25M1803681](https://epubs.siam.org/doi/10.1137/25M1803681) | 305–317 | 01A2 / 01A3 |
| Rachel Greenfeld | Translational Tilings: Structured or Wild? | [10.1137/25M1801694](https://epubs.siam.org/doi/10.1137/25M1801694) | 76–96 | 007C / 007K，复用 |

11 篇新报告阅读了数学正文；Greenfeld 沿用上次已审阅的全文整合记录。阅读正文不等于阅读其参考文献中的全部证明。部分出版社 PDF 二进制下载返回 HTTP 403，但官方全文 HTML 或网页工具的 PDF 文本提取可读；这些情况没有宣称成功下载本地 PDF。Wemyss 使用正式出版版本及 Glasgow 仓储副本，其他可核实的 arXiv 版本按上表使用。详细阅读位置、版本、提取方式与限制保存在各主题 JSON 中。

## 首轮入站组织

- 新入口 `013Z` 为“代数结构、表示与几何”，由代数主页 `0062` 链接；不用会议分组命名博客知识目录。
- 本次新增 **477 页**：448 个数学条目、14 个导读、15 个文献页。全站由 1044 页增至 **1521 页**。
- 共享基础 `013Y` 下补充模、张量积、正合列、导出范畴、幺半范畴、概形与约化群概形等定义。复用已有群、子群、陪集、范畴、环谱、层等节点。
- `00IE` 保留等式理论视角，基础环与模术语改指向独立定义。主同余子群统一指向 `01FD`；`0167` 只陈述算术情形的有限指数推论。
- 各报告拆为定义、构造、定理、例子、证明、证明路线与开放问题。必要前置直接指向知识节点；导读只组织阅读顺序。
- 新交换图沿用 Sterling 的 TikZ-CD 编译路径；新增文类标签通过主题覆盖文件显示为中文。不新增手写“相关页面”正文块。

`research/icm2026-algebra.json` 跟踪 12 场报告和 490 个页面（477 个新页、13 个已有铺砌相关页面）。七份 `research/algebra-*.json` 分别记录共享基础和六个主题的逐页决定、来源及必要前置。`research/site-evergreen-audit.json` 是合并后的全站审阅登记。

## 首轮内容边界

这里的“全部报告”指名单中的 12 场均有来源和知识入口，不表示每篇报告的每个分支及全部技术证明已经穷尽。报告中的开放问题按该报告的状态记录，不声称全面核查了之后的全部文献。

| 报告 | 本轮主要入站内容 | 尚未完整展开的内容 |
| --- | --- | --- |
| Achar–Riche | 最高权、倾斜模、移位、Hecke 代数与 p 典范字符公式 | 简单字符与 Finkelberg–Mirković 分支；支持簇、Humphreys、Lusztig–Vogan 与 co-t 结构；深层几何证明 |
| Angiono | Nichols 代数、玻色化、阿贝尔型提升、余循环变形、模范畴构造 | 完整分类表、Weyl 群胚、非阿贝尔族及 Morita 分类；分类定理只附证明路线 |
| Avni–Meiri | 共轭宽度、同余子群问题、群范数刚性与 Spin 算术群的第一种情形 | 纯 Archimedean 的另一种情形及全部算术论证；报告预告无条件结果，但其所引完整证明依赖 GRH，未声称读到无条件完整证明 |
| Braden–Proudfoot | KLS 递推、拟阵、扇、代数性交上同调、top-heaviness | Coxeter/矩图及正特征分支；Hodge–Riemann 关系的证明和文献中仍在准备的比较结果 |
| Iyengar | 自由性、导出作用、Koszul 构造、Wiles 亏量与高余维判据 | 一般非满射情形、无限生成大 Cohen–Macaulay 模、Galois 变形及模性提升证明 |
| Navarro | Clifford/射影表示、McKay、块与高度零、Galois 与权的猜想 | Glauberman、Dade、完整块关系及归纳 Feit 条件；分类有限单群后的情形验证 |
| Rietsch | Edrei 参数、有限坐标、标准截断极限、热带参数化 | 一般近似矩阵极限、Thoma、量子 Schubert、Peterson/镜像及提升定理；对数极限只在明确控制的情形下陈述 |
| Schroll | Gentle 代数、曲面/曲线模型、dg 范畴、锥、例外序列与导出不变量 | 完整 Fukaya 理论、Hochschild/TT、变形、orbifold 及其分类证明 |
| Snowden | 寡轨置换群、测度、积分矩阵、张量范畴、半单性、增长、Delannoy | 更一般 pro-oligomorphic 设置、Fraïssé、重构、融合/Adams/中心；若干定理保留明确的外部输入 |
| Stavrova | 报告的编号结果、初等子群、非稳定 K₁、挠子、多项式不变性与 A¹ 路径 | 根计算、Weil 限制、LG 环、稳定化与高阶 KV 的完整前置网及深层证明；3.5 只取明示的仿射群特例 |
| Wemyss | 收缩代数、三维 flop 重构、导出及 A∞ 路线、A 型计算 | 六族完整分类、数值不变量、奇异终端情形；引用“in preparation”的预告结果不提升为已读完整证明 |
| Greenfeld | 复用已拆解的平移铺砌、周期与不可判定性路径 | 沿用 `ICM2026_LOGIC_SOURCE_AUDIT.md` 的边界 |

这些限制同时保留在机器可检查的来源清单中。对疑似原文排印问题或需要加强假设的陈述，不机械照抄：包括共轭宽度猜想排除中心元、Toeplitz 权指标与极限条件、拟阵单调性不等式方向。对应记录说明了修正或暂不采用的理由。

## 验证与复查

```sh
node scripts/sync-algebra-audit.mjs
node scripts/check-algebra-notes.mjs --source-only
node scripts/check-site-notes.mjs --source-only
forester build forest.toml
node scripts/check-algebra-notes.mjs
node scripts/check-site-notes.mjs --katex /path/to/katex/dist/katex.js
node scripts/check-logic-notes.mjs --katex /path/to/katex/dist/katex.js
git diff --check
```

来源检查核对 15 位报告人各出现一次、12 场报告、文献 DOI、页面标题与构建产物；全站检查另核对链接、可达性、必要前置、公式与交换图资源。脚本通过不是数学正确性的形式化证明，也不能代替逐页阅读。

首轮验证结果（1521 页的历史快照）：

- Forester 完整构建成功；1521/1521 页登记且从主页可达，377 个初次审阅的原始 ID 全部保留。
- 1271 个知识节点登记 3721 条必要前置边，无环、无失效目标、无前置指向导读；全站检查无错误及警告。
- 10842 个生成公式片段通过 KaTeX；12 幅 Sterling SVG 资源存在且格式有效。投射模提升图另经 SVG 光栅化实际查看。
- 逻辑来源回归检查通过：623 页、8 篇论文、3558 个公式、4 幅研究图。
- 共享基础 48 页另行交叉复核，31 页补正约定、假设或链接；非交换模、导出范畴、概形和相容图的复核理由保存在 `research/algebra-foundations.json`。
- `git diff --check` 通过；新增页面另检查行末空白。XSL 转换确认“定义”“反向链接”“相关页面”等可见标签为中文，内部 `data-taxon` 标识仍保留英文。
- 本地入口返回 HTTP 200。内置浏览器工具访问被 `ERR_BLOCKED_BY_CLIENT` 拦截，未声称完成全部页面的浏览器视觉验收。

本地入口为 `http://localhost:8083/math-blog/013Z/index.xml`。首轮完成时尚未提交或推送；后续深化与发布验收另记如下。

## 第二轮：深层分支与证明

2026-09-23，按后续请求在首轮内容上继续展开，新增 **224 页**，不重建已有入口。全站由 1521 页增至 **1745 页**；两轮代数工作累计新增 701 页。来源清单现跟踪 714 页，其中 13 页沿用既有铺砌专题。新增内容仍采用独立知识节点与显式前置，不将报告正文拼接为长章节。

| 分支 | 本轮新增 | 主要展开及证明范围 |
| --- | ---: | --- |
| 共享同调基础 | 21 | 比较映射及链同伦唯一性、Ext 选择无关性与维数移位、扩张分类及 Baer 和、Tor、马蹄引理、两变量长正合列 |
| Hopf 与寡轨群 | 24 | 群基玻色化的全部 Hopf 公理、非阿贝尔中心化子参数化、有限型 Fraïssé 极限、带标记合并轨道及迹配对 |
| 算术群与特征标 | 29 | 词宽度的商与核估计、profinite 检测、Clifford 及投射重数空间、阿贝尔 Glauberman 特例、明确半直积的 McKay 对应 |
| 表示论与变形 | 43 | 模支持与零化子、有限群概形支持的条件性推导、bar 分解、HH⁰/HH¹、HH² 对一阶固定单位变形的分类 |
| 交换代数与 flop | 41 | Nakayama、极小自由分解、正则元提升、Koszul 计算、同调作用反例、导出商显式模型、Laufer 型词基及交换化 |
| 矩图与全正性 | 36 | 单边及 A₂ 矩图、秩一 Soergel 分解、差商辫关系、S₃ 量子多项式、三阶 Toeplitz 局部化环同构及正性 |
| 初等矩阵与 K₁ | 30 | 半局部消元、Jacobson 级别相对消元及交换子、稳定 Whitehead、精确 K₁ 比较与显式多项式路径 |

每份 `research/algebra-*.json` 的 `deepening` 字段列出新增与修订 ID、证明适用范围、实际阅读的原始文献段落、条件性推导及剩余缺口；首轮阅读和覆盖记录保留。新增的 11 个文献页用于补充证明来源，不能代替本届报告本身。

这里“完整证明”限定于节点明确陈述的命题及其列出的已知前置，不表示论文中的全部一般定理均已补证。一般 Nichols 分类、Humphreys/Lusztig–Vogan、Fukaya/完整 TT 演算、Auslander–Buchsbaum 与一般模性提升、Peterson 对应、一般约化群局部整体原理等仍保留外部输入。低秩、半局部或一阶特例不冒充一般结论。Avni–Meiri 的预告无条件结果与其已公开的 GRH 证明、Wemyss 引用的准备中结果，也未因本轮增加例子而升级证明状态。

发布工作流已加入全站前置图及代数来源检查，并在构建后检查生成页面与原逻辑专题的回归。检查失败即停止 Pages 发布；机器检查不能替代数学审阅。

### 第二轮发布前验收

- Forester 完整构建成功；1745/1745 页登记且从主页可达，377 个原始 ID 保留。全站来源检查无错误或警告。
- 1483 个知识节点、4446 条必要前置边，无环、无失效目标、无前置指向导读。代数清单核对 15 位报告人、12 场报告与 714 个页面。
- 14597 个生成公式片段通过 KaTeX，14 幅 Sterling SVG 资源通过检查；逻辑回归仍为 623 页、8 篇论文、3558 个公式及 4 幅研究图。
- 21 个共享证明节点另行独立复核，修正 `01SK` 第一变量连接映射与推出扩张类之间的负号，并补出马蹄微分的计算；之后重建及复测通过。
- XSL 实际转换检查确认示例页的文类与页脚标签为中文。本地 `01SJ` 页面返回 HTTP 200。
- 新图的同一 TikZ 源经独立路径化渲染核查了箭头、标记及布局；未修改 Forester 的 SVG 生成模式。直接光栅化其内嵌 WOFF 的 SVG 会丢失字体，不能以该预览断言浏览器字体错误。内置浏览器访问本地仍被客户端拦截，故不声称完成浏览器逐页视觉验收。
- `git diff --check` 与 701 个新源文件的行末空白检查通过。发布仅包括数学笔记、来源登记、校验脚本、工作流及根目录主题覆盖；不包含无关项目目录、临时文件、生成站点或主题子模块的 gitlink。
