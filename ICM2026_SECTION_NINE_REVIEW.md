# ICM2026 Section 9 动力系统目录与本站收录核查

目录检索日期：**2026-10-19，Asia/Shanghai**。本文件先记录三批整合结果，随后保留整合前的目录核查，便于核对新增内容与原有材料。精确验收时间另记于各 JSON 记录。

## 最后一批整合结果

动力系统主节的 10 场报告均已有对应专题；3 场跨列报告复用原专题。`0069` 按正式出版页序列出主节报告，并保留跨列报告及原有的其他专题。

| 报告 | 专题入口 | 原子知识页 | 文献页 |
| --- | --- | ---: | --- |
| Dzmitry Dudko | `3600` Mandelbrot 局部连通性与复重整化 | 52 | `icm2026-dudko` |
| Simion Filip | `3700` 超越齐性空间的测度刚性 | 54 | `icm2026-filip` |
| Adam Kanigowski | `3800` 统计随机性如何受光滑几何约束 | 55 | `icm2026-kanigowski` |
| Luna Lomonaco、Sabyasachi Mukherjee | `3900` 从 Schwarz 反射到群与有理映射的代数缝合 | 53 | `icm2026-lomonaco-mukherjee` |

本批新增 214 个原子知识页、4 个专题综述和 4 个文献页，共 222 页。与上一批尚未发布的 142 页合并后，本次发布包含 7 场报告的 364 页。多项式样映射、混合等价及拟共形概念由两个复动力系统专题共享；拟共形映射的解析定义、抛物样混合共轭和抛物拉直定理分别独立成页。Green–Kubo 公式复用 `330W`，SRB 测度定义集中于 `380K`，并由上一批的 `3315` 直接链接。

正式报告的综述内容已分别整理，逐页记录区分完整局部证明、引用定理、证明思路、猜想与开放问题。拉直与 David 手术、重整化双曲性、测度分类和 Bernoulli 匹配等深层证明保留准确来源及读取范围。目录覆盖不等于重写所有被引研究论文的证明。

逐页来源、前置关系与最终文件散列见 `research/icm2026-dynamics-final-reports.json` 及对应 `-snapshots.json`。数学复核分别见 `research/dynamics-final-parent-review.json` 与 `research/dynamics-final-complex-review.json`。本地验收记录见 `research/icm2026-dynamics-final-validation.json`；提交、部署与线上内容核验另记于发布记录。

合并发布前的本地验收通过 37 组源文件检查，全站构建生成 6,208 个静态 HTML 页面，77,347 个公式和 48 个交换图通过检查。两批页面在桌面与手机端合计完成 732 次浏览器检查，另逐张查看 26 张专题及重点条目截图。兼容地址、搜索、导航与长公式滚动均已检查；数学复核中记录的问题全部关闭，深层引用证明仍按上述范围保留。

## 第二批整合结果

第二批完成时，动力系统主节共 10 场，本地有同篇专题 6 场；3 场跨列报告复用原专题。当时尚无同篇专题的主节报告为 Dudko、Filip、Kanigowski、Lomonaco–Mukherjee，共 4 场，现已由最后一批补入。

| 报告 | 专题入口 | 原子知识页 | 文献页 |
| --- | --- | ---: | --- |
| Jérôme Buzzi | `3300` 从高熵双曲块到混沌的统计规律 | 46 | `icm2026-buzzi` |
| Danijela Damjanović | `3400` 交换对称如何迫使动力系统具有代数结构 | 45 | `icm2026-damjanovic` |
| Bertrand Deroin | `3500` 复曲面叶状结构的稳定域 | 45 | `icm2026-deroin` |

本批新增 136 个原子知识页、3 个专题综述和 3 个文献页，共 142 页，登记 561 条数学前置关系。一般熵、K 自同构、Anosov 系统、概率空间、全纯叶状结构等定义直接复用已有页面。部分双曲性与 holonomy 的定义由本批各专题共同引用。

三篇正式报告均按全文整理，补充论文按固定版本登记实际读取范围。独立复核检查 82 个重点页面；直接计算、局部证明、引用定理、猜想和后续预印本分别标明。SPR 编码与极限定理、高秩作用分类、KAM 迭代、全局叶状结构稳定性等研究证明仍保留原文引用，不将本批整合视为这些论文全部证明的重写。逐页记录见 `research/icm2026-dynamics-second-reports.json` 及对应 `-snapshots.json`；独立复核见 `research/dynamics-second-source-review.json`。

第二批首次本地验收时尚未提交或推送，36 组源文件检查通过；构建生成 5,986 个静态 HTML 页面，链接、公式及前置关系检查通过；143 页在桌面和手机端共 286 次浏览器检查通过。该历史记录见 `research/icm2026-dynamics-second-validation.json`；本次合并发布会重新检查这些页面及其新增的跨专题链接。

## 首批整合结果

首批完成时，动力系统主节有同篇专题 3 场；3 场跨列报告均已复用原专题并接入 `0069`。当时尚无同篇专题的主节报告有 7 场。

| 报告 | 专题入口 | 原子知识页 | 文献页 |
| --- | --- | ---: | --- |
| Tim Austin | `3000` 从有限模型看可数群作用的随机结构 | 45 | `icm2026-austin` |
| Pierre Berger | `3100` 野性动力学：稳健相切、通用模型与统计涌现 | 46 | `icm2026-berger` |
| Misha Bialy、Andrey E. Mironov | `3200` 可积台球：从反射守恒量到形状刚性 | 51 | `icm2026-bialy-mironov` |

本批新增 142 个原子知识页、3 个专题综述和3个文献页，共 148 页。基础定义优先链接既有条目；正文补入 46 处基础术语直达链接。可在本地展开的计算与证明写入独立条目，深层引用定理保留准确的假设、来源和证明范围。

当前收录数据见 `research/icm2026-dynamics-section-coverage.json`，首批逐页登记及最终源文件散列见 `research/icm2026-dynamics-first-reports.json` 和同名 `-snapshots.json`。历史本地验收见 `research/icm2026-dynamics-first-validation.json`。首批已随提交 `291d07de8f25828686be328bb623b589fed79665` 推送并成功部署；150 个正式页面和 6 个兼容地址均通过 HTTPS 内容核对。核对时仅归一化跨平台 XSLT 生成的显示公式周围缩进，保留正文与公式内容。独立干净构建、工作流及线上核验见 `research/icm2026-dynamics-first-release.json`。

以下各节的“基线”“计划”和待验收状态均指本批整合前的历史核查，当前状态以上述记录为准。

## 目录依据与读取范围

| 来源 | 本次实际读取范围 | 用途与限制 |
| --- | --- | --- |
| [ICM 官方讲者目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers) | 09:37:10 +08:00 下载的完整 HTML / Next.js payload；305 个唯一公开记录 ID，101 段外引简介全部按 UTF-8 字节数解析；主节、简介首行的 † 跨列、联合报告声明与类别 | 不限于首次显示的字母序列表；不按简介中“研究动力系统”等文字推定所属节 |
| [SIAM 第五卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978698) | Section Nine 标题起，至 Section Ten 标题前的全部 10 个章节，印刷页 3–190；逐篇打开章节页，核对题名、全部作者、页码、DOI、摘要/关键词 | 确定本节目录及其顺序；不是全文精读；出版题名未必等于现场报告题名 |
| [SIAM 第三卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978650) | Section One 的 Greenfeld 章节，76–96 页；章节页元数据及摘要 | 仅核对其正式出版信息；主节和跨列以组织者目录为准 |
| [SIAM 第四卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978674) | Section Five 的 Bader 24–40 页、Irie 179–198 页；章节页元数据及摘要 | 同上；不将整卷或所有几何报告视为 Section 9 |
| [SIAM 第二卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978636) | 完整全会卷目录；Dolgopyat、Hee Oh、Gérard 的章节页元数据及摘要 | 与全部 19 位普通全会、3 位特别全会的目录类别对照；全会均不计入 Section 9 |
| [Ziegler 作者录像目录](https://math.huji.ac.il/~tamarz/video.html) | 页面中 ICM2026 录像的题名条目；未看录像 | 仅支持报告题名；不据此宣称读过报告或取得 2026 书面章节 |
| 本地 `trees/**/*.tree` | 5,696 个源文件作姓名/别名、题名、DOI、核心主题检索；再读命中的 Outline、文献页及相关条目 | 核查本地目录覆盖；未重建网站、未检查线上部署、未重审全部数学证明 |

为判别“相关材料”，另抽查了 Berger 的伪旋转相关段落/文献、Filip §6 的 K3 讨论及相关文献、Deroin 的文献定位、Kanigowski 的 Anosov/Bernoulli 相关段落。没有把这些局部读取记为全文阅读。SIAM 页面通过联网工具读取，可能返回缓存或索引版本；第二卷显示的抓取时间为三周前，不声称本次从出版商源站取得了未缓存快照。第三方搜索结果未用作目录事实的依据，外部网页仅作为数据读取。

官方 HTML 为 1,782,134 字节，SHA-256：`a65c3de92b843ffd01852b7de007da5909b748ee43df3bddd4d6633111757c7d`。305 是公开目录记录数，包含其他活动类别、同人在不同角色的记录及一个 † 图例，不能说成 305 位不同的邀请讲者。额外的第 306 个 `firstName` 字段属于 `ContactPlanner`，不是讲者。

## 总数与首批顺序

**主节 10 场、12 位讲者；跨列 3 场、3 位讲者；合计 13 场、15 位讲者。** 两个联合报告分别是 Bialy–Mironov、Lomonaco–Mukherjee，各按一场计。主节的 12 位讲者均没有另列其他节；跨列三场的全部附加节号见下表。

**前三场只按第五卷 Section Nine 的印刷页顺序：**

1. **Tim Austin**，[*Some Recent Developments in Structural Ergodic Theory*](https://epubs.siam.org/doi/10.1137/25M1805564)，3–23 页；计划前缀 `30`、入口 `3000`、文献 `icm2026-austin`。
2. **Pierre Berger**，[*Wild Dynamics on Manifolds*](https://epubs.siam.org/doi/10.1137/25M1810787)，24–41 页；计划前缀 `31`、入口 `3100`、文献 `icm2026-berger`。
3. **Misha Bialy、Andrey E. Mironov**，[*Integrable Billiards and Related Topics*](https://epubs.siam.org/doi/10.1137/25M1804078)，42–58 页；计划前缀 `32`、入口 `3200`、文献 `icm2026-bialy-mironov`。

三篇的 `planned_integration.status` 均为 `pending-parent-validation`；基线 `outline` 和 `reference` 均为 `null`。不把跨列的 Bader、Greenfeld、Irie，或任何全会报告插入此排序。计划页即使由其他代理新建，也不自动视为已验收。

## 全部本节报告

下表作者按 SIAM 署名；讲者目录原始名字另保存在 roster 中。所有行主节均为 9、附加节均为空。

| 序号 | 出版作者 | 正式章节题名与 DOI | 页码 | 基线核查 |
| --- | --- | --- | --- | --- |
| 1 | Tim Austin | [Some Recent Developments in Structural Ergodic Theory](https://doi.org/10.1137/25M1805564) | 3–23 | 相关材料：`007B`、`009U`、`00S2`、`00S4`、`00WF`；无本篇专题 |
| 2 | Pierre Berger | [Wild Dynamics on Manifolds](https://doi.org/10.1137/25M1810787) | 24–41 | 相关材料：`0P00` 及伪旋转分支；无本篇专题 |
| 3 | Misha Bialy、Andrey E. Mironov | [Integrable Billiards and Related Topics](https://doi.org/10.1137/25M1804078) | 42–58 | 缺失：未发现可积台球专题；联合一场 |
| 4 | Jérôme Buzzi | [Chaos on Surfaces and Beyond: A New Notion of Dynamical Hyperbolicity](https://doi.org/10.1137/25M1807071) | 59–78 | 缺失：强正再生、Borel 同宿类与最大熵测度主线尚无对应专题；一般熵/Anosov 定义不算收录 |
| 5 | Danijela Damjanović | [Classifying Dynamics with Many Symmetries](https://doi.org/10.1137/25M1807964) | 79–99 | 缺失：尚无高秩作用及大对称群的光滑分类专题；`2D00`、`2F00` 只是相邻背景 |
| 6 | Bertrand Deroin | [Structural Stability in Moduli Spaces of Foliations on Complex Algebraic Surfaces](https://doi.org/10.1137/25M1807186) | 100–115 | 相关材料：Pereira 的 `0BH0` 全纯叶状结构；不是结构稳定性/分岔区域报告的收录 |
| 7 | Dzmitry Dudko | [On the MLC Conjecture and the Renormalization Theory in Complex Dynamics](https://doi.org/10.1137/25M1807101) | 116–135 | 相关材料：Xie 的 `0K00`、Julia 集 `0K10`、参数重标度 `0K1L`；尚无 MLC 主线，两个“重整化”不可等同 |
| 8 | Simion Filip | [Measure Rigidity beyond Homogeneous Dynamics](https://doi.org/10.1137/25M1811756) | 136–155 | 相关材料：`2R00` 中 Filip–Tosatti/K3 动力学结果；不是一般测度刚性报告 |
| 9 | Adam Kanigowski | [Ergodic and Statistical Properties of Smooth Systems](https://doi.org/10.1137/25M1804315) | 156–167 | 相关材料：`007B`、`00A0`、`00A2`、`00A3` 等光滑遍历、混合及 K 系统；无本篇专题 |
| 10 | Luna Lomonaco、Sabyasachi Mukherjee | [Algebraic Correspondences and Schwarz Reflections: Where Rational Dynamics Meets Kleinian Groups](https://doi.org/10.1137/25M1805928) | 168–190 | 相关材料：`0K1B` 代数对应、`2F00` Kleinian 群；没有 Schwarz 反射及 mating 主线；联合一场 |

姓名对照：组织者将 Bialy 登记为 **Michael Bialy**，而 Mironov 的互相联合声明称其 **Misha Bialy**；出版署名使用后者。组织者的 **Andrey Mironov** 对应出版署名 **Andrey E. Mironov**。结构化讲者名字 **Jérome Buzzi** 与简介/出版署名 **Jérôme Buzzi** 分别保留。Lomonaco 简介中的 **Sabyasashi** 为原文拼写，结构化记录与 SIAM 均为 **Sabyasachi**，不增加一位讲者。

## 全部跨列报告

跨列报告按主节、所在卷页序列出，不参与本节“前三场”排序。

| 讲者及出版作者 | 主节 | 全部附加节 | 章节题名与 DOI | 卷/页码 | 可直接复用的同篇入口 | 基线是否在 `0069` |
| --- | --- | --- | --- | --- | --- | --- |
| Rachel Greenfeld | 1 | 2、3、5、8、9、13 | [Translational Tilings: Structured or Wild?](https://doi.org/10.1137/25M1801694) | 3 / 76–96 | **`007C`**；文献 `007K` | 是 |
| Uri Bader | 5 | 7、9 | [Higher Property T and Below-Rank Phenomena of Lattices—An Extract](https://doi.org/10.1137/25M1806983) | 4 / 24–40 | **`2D00`**；文献 `icm2026-bader` | 否 |
| Kei Irie | 5 | 9 | [Strong Closing Lemmas in Hamiltonian Dynamics](https://doi.org/10.1137/25M1805400) | 4 / 179–198 | **`2H00`**；文献 `icm2026-irie` | 否 |

Bader 的正式章节只有一位作者；Roman Sauer 是另一个长版综述的合作者，不能因此把此场改成联合报告。Greenfeld 属于 Special Section Lectures，仍然是有明确主节的分节报告，不是全会。三篇均已有同篇专题，主代理可直接复用以上入口；此核查不修改 `0069`。

## 收录口径与基线

**已有专门专题**指有与正式章节对应的 Outline、文献页和实质内容。它不表示逐句收录原文、所有深层证明都已重写或本轮已通过上线验收。“相关材料”是编辑判断，指已有专门材料触及具体研究对象或分支；它们放在 `reusable_existing_notes`，不冒充本篇 `outline`。只有一般定义或相邻领域背景时，仍归“缺失”。

| 类别 | 本节 10 场 | 跨列 3 场 | 合计 13 场 |
| --- | ---: | ---: | ---: |
| 已有专门专题 | 0 | 3 | 3 |
| 仅相关材料 | 7 | 0 | 7 |
| 核心主题缺失 | 3 | 0 | 3 |
| 尚无同篇专题 | 10 | 0 | 10 |

前三篇的待验收计划是另一个维度，不能再与上表相加。相关材料多寡也不改变“主节 0/10、跨列 3/3”的同篇专题基线。主代理随后告知已将 `3000`、`3100`、`3200`、`2D00`、`2H00`、`007C` 加入首页，并把原有另外三篇保留为其他专题；这只是主代理实施的导航变更，不是内容验收。本批不新增全会首页入口，以上表格和 `on_subject_landing` 字段仍明确表示整合前基线。

基线提交为 `f9c957a5cd1a68974405f845f0dee92d4545d13b`；源文件清单核对时间为 `2026-10-19T01:40:52.068Z`（北京时间 09:40:52）。5,696 个 tree 文件按“相对路径 + TAB + 文件 SHA-256 + LF”排序所得清单 SHA-256 为 `948cf1f7e8a487ee0d9e03e7a87c473130af4cae321d7e18cb8c3206a14fe09d`。`trees/0069.tree` 的基线 SHA-256 为 `0ab7f58234d4a726ce07484929275d867c9ef28f6f198efa804fa4157012f9c3`。这些是本地源文件状态，不是部署证明。

## 相关但不计入的目录

`0069` 基线原有 `0V00`（Mirek，主节 8）、`0P00`（Florio 的 Bourbaki 报告）、`007B`（Gerber–Kunde，主节 1，联合一场）、`007C`（Greenfeld，明确跨列）。其中只有 `007C` 属于本次官方 Section 9 目录。Mirek、Gerber、Kunde 均没有明确跨列到 9。

其他已存在且可作相关材料的专题有 Xie `0K00`（主节 4）、Pereira `0BH0`（主节 4）、Canary `2F00`（主节 5）、Cristofaro-Gardiner `1400`（主节 6）、Tosatti `2R00`（主节 5）。本次完整讲者目录检查均未发现其跨列到 9，故不得增加分节场数。Canary 的另一个 outreach 记录也不增加一场分节报告。

| 相关全会讲者 | 已核对的题名 / 出版信息 | 本站状态；全部排除于 13 场之外 |
| --- | --- | --- |
| Dmitry Dolgopyat | [Randomness, Rotations, Renormalization, and Resonances](https://doi.org/10.1137/25M1806971)，卷 2，35–50 | 无同篇专题；遍历平均与随机格条目只作背景 |
| Hee Oh | [Dynamics and Rigidity through the Lens of Circles](https://doi.org/10.1137/25M1810726)，卷 2，240–271 | 无同篇专题；`2F00`、`2Q00` 仅为相关几何材料 |
| Tamar Ziegler | 作者录像目录题为 *Structure of Sets with an Unexpected Number of Arithmetic Pattern* | `2900` 是以 2014 文本为据的背景专题；本次所读卷 2 目录无对应书面章节，未读完整录像 |
| Patrick Gérard | [Hardy Spaces of Holomorphic Functions and Explicit Formulae for a Class of Integrable Partial Differential Equations](https://doi.org/10.1137/25M1805497)，卷 2，81–101 | 已有 `2A00` 及文献 `icm2026-gerard`，属于邻近的可积 PDE 全会材料，不是 Section 9 |

全会身份按完整官方 payload 的 `Plenary Lectures` / `Special Plenary Lectures` 类别核定，而不是从空白 `designation` 猜测。19 位普通全会及 3 位特别全会名单保留在 coverage 的 `plenary_audit`。目前没有已建立的 `0069` 全会领先入口，因此 `editorial_leading_topics` 保持空数组，是否新增由主代理决定。Ziegler 作者网页使用单数 **Pattern**，现有本站文献使用 **Patterns**，本次记录差异但不改该文献。

## 交付与复核

- `research/icm2026-section-nine-roster.json`：完整目录提取结果、来源散列、人数/场数、跨列证据、联合报告及姓名对照。
- `research/icm2026-dynamics-section-coverage.json`：沿用 Lie 的 `reports`、`cross_listed_reports`、`counts`、`sources`、`editorial_leading_topics` 结构；另记基线、待验收计划和排除项。
- `ICM2026_SECTION_NINE_REVIEW.md`：本说明及全部正式目录。

直接复用现有 `scripts/extract-icm-section-roster.mjs`，无需新增或修改提取脚本。重提取命令为 `node scripts/extract-icm-section-roster.mjs speakers.html 2026-10-19 9`；输出的核心字段应与 roster 一致。两份 JSON 的结构、计数、唯一 DOI、全部讲者 ID 对应、页序、联合分组、已有入口/文献及相关条目存在性均作本地复核。没有写报告知识页、修改共享注册表或首页，没有提交或推送；后续整合与验收归主代理。
