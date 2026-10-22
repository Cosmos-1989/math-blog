# ICM2026 Section 11 数学物理名册与覆盖核查

核查日期：2026-10-22，Asia/Shanghai。官方名册与出版身份的核查先于本轮写作。以下先记录本轮整合结果，其后保留增补前的冻结基线，便于区别既有内容与新增专题。

## 已发布的两批专题

按论文集页码顺序，首批三场报告已建立综述、原子条目与文献页，通过独立内容复核，并以提交 `84f4f5c0e659fcd7659672687a64062e858142b8` 推送至 `main`。GitHub Pages 于 2026-10-22 03:33:04 UTC 完成部署。147 条线上页面及兼容路径通过严格 TLS 检查，并与该提交的独立构建逐页比对一致；发布记录见 `research/icm2026-mathematical-physics-first-release.json`。

| 报告 | 已发布专题 | 原子条目 |
|---|---|---|
| Amol Aggarwal | [Toda 多体渐近](https://opetope.cc/4B00/) | 39 |
| Pablo A. Ferrari | [硬杆与箱球系统](https://opetope.cc/4C00/) | 42 |
| Davide Gaiotto | [范畴化 't Hooft 展开](https://opetope.cc/4D00/) | 49 |

合计新增 130 个原子页、3 篇综述及 3 个文献页，登记 400 条直接前置依赖，直接复用 77 个既有知识页面。有限维计算、局部推导和证明分别写入条目；引用的深层研究定理、条件性识别与物理猜想保留其准确地位，逐项范围见三个研究包。

第二批按相同顺序继续整理三场报告。

| 报告 | 已发布专题 | 原子条目 |
|---|---|---|
| Tom Hutchcroft | [长程渗流](https://opetope.cc/4E00/) | 41 |
| Urmila Mahadev | [经典通信与量子系统](https://opetope.cc/4F00/) | 44 |
| Fabio Martinelli | [动力学约束模型](https://opetope.cc/4G00/) | 45 |

第二批新增 130 个原子页、3 篇综述及 3 个文献页，登记 400 条直接前置依赖，直接复用 44 个既有知识页面。Hutchcroft 专题从独立边渗流、分枝过程与尺度微分进入临界指数和尺度极限；Mahadev 专题从量子态、LWE 与陷门函数进入量子性检验和经典验证；Martinelli 专题从可逆 Markov 动力学、条件方差与自举渗流进入缓慢松弛和二维普适性。

第二批以提交 `5211fad7fc4921292b8dc12248483fe0637ed32b` 推送至 `main`，GitHub Pages 于 **2026-10-22 05:46:58 UTC** 完成部署。该提交及固定主题版本另作独立构建，27,834 个 HTML/XML 文件与此前验证结果在非实质空白归一化后相同。141 个线上页面及 6 个旧路径均以严格 TLS 获取，并与独立构建的完整 HTML 比对一致。证据见 `research/icm2026-mathematical-physics-second-release.json`。

当前线上收录为主列 6 场、跨列 1 场，合计 **7/15 场**。Zaag 的 `4900` 直接复用。Yau 的既有全会专题 `2B00` 置于数学物理首页首位，单独计数；Sabin 的 Bourbaki 专题 `0Q00` 保留于其他专题。

各批本地验证保存在对应的 `*-validation.json`，不改写为后来的发布状态。来源范围、证明范围和未展开分支分别保存在三个 packet；独立内容复核保存在对应的 `mathematical-physics-*-review.json`。本次先发布第二批，再整理第三批，发布状态分别记录。

第二批已完成三份独立复核、42 项全站源码检查及静态 HTML 构建。全站 6,958 页均可达，89,114 个公式通过解析；137 个相关页面分别在 1440 和 390 像素宽度检查，共 274 项页面显示检查通过。另检验 320 像素阅读界面、搜索、中文标签、长公式滚动及旧 XML 路径，人工查看了 10 张代表性截图。完整本地证据见 `research/icm2026-mathematical-physics-second-validation.json`，后来的线上状态由第二批 release 记录确定。

Mahadev 专题保留 ICM 报告引用的 LWE 经典验证定理。所读验证论文 v3 的全定义域固定掩码实现与奇数模数平移模型存在不匹配；`4F2C` 单独证明相应奇轨道障碍，`4F29` 记录具体定义和实现的区别。未以未经核实的编码条件补造修订，也未将这一具体构造问题表述为一般验证定理的反例。

## 第三批本地整合

| 报告 | 本地专题 | 原子条目 |
|---|---|---|
| Benoit Pausader | [无碰撞动力学的稳定性](http://localhost:8083/4H00/) | 63 |
| David Pérez-García | [二维量子相的分类](http://localhost:8083/4I00/) | 48 |
| Rémi Rhodes、Vincent Vargas | [Liouville 共形场论](http://localhost:8083/4J00/) | 55 |

第三批新增 **166 个原子页、3 篇综述及 3 个文献页**，登记 **507 条直接前置依赖**，直接复用 **92 个既有知识页面**。三篇综述按论文集顺序接入 `006B`，联合报告仍计一场。加上本批，本地共收录 **10/15 场**；第三批尚未推送，不属于上述第二批发布提交。

Pausader 专题从特征线、自由平均和 Poisson 场估计进入修正散射、Landau 阻尼与 BGK 轨道，分别记录全空间、环面和吸收边界的假设。Pérez-García 专题从有限自旋系统、状态及张量网络进入谱隙不可判定性与 Haag 对偶。Rhodes–Vargas 专题从高斯场、乘性混沌和零模态积分进入 DOZZ 公式、曲面缝合和连续谱自举。

初等推导和有限维证明在原子页展开；波算子存在性、一般弱 Hopf 模型、GMC/DOZZ 及自举收敛等研究证明保留精确引用与适用条件。开放的分类和稳定性问题仍标为问题或猜想。每篇的逐项证明范围、实际阅读位置与未展开分支见对应 packet，不以专题入口的存在表示已重证全部研究结果。

三份独立复核均已通过，所有报告内原子页、文献页、packet 及实际审阅的共享前置页面按源码哈希绑定。复核修正了维数条件、张量腿数、融合范畴公理、无界算子定义域及文献定位。共用 `0Z1C` 的 Schwarz 不等式改为抽象 C* 代数内的直接证明，状态范数界通过绝对收敛级数得到，不依赖尚待构造的 GNS 表示。

本批已通过 **43 项全站源码检查**及静态 HTML 构建。全站 **7,130 页**均可达，**91,878 个公式**和 50 个交换图通过解析检查。173 个相关页面在 1440 与 390 像素宽度分别检查，共 **346 项页面显示检查**通过；搜索、长公式完整滚动、旧 XML 路径的查询参数与片段保留均正常。另检查 320 像素阅读界面，生成 20 张证明页截图，并人工打开 10 张代表截图查看。有限模型计算验证了 BGK 质量、环面码、四腿张量的 Gram 因子、零模态积分和二级 Virasoro 退化关系。完整本地证据见 `research/icm2026-mathematical-physics-third-validation.json`；该记录明确标记本批尚未推送、尚未部署。

尚余 **5 场**：Sasada、Staffilani、Sun、Xu，以及尚未识别出版题名的 De Roeck。De Roeck 保留在官方名册中，未知出版身份不作取消报告的推断。

## 增补前的冻结结论

- 官方主列 **14 场、15 人**；其中 Rémi Rhodes 与 Vincent Vargas 为一场联合报告。
- 明确 † 跨列 **1 场、1 人**：Hatem Zaag，主列 8，跨列 10/11。
- 去重合计 **15 场、16 人**。普通 Section Lectures 13 场，Joint Section Lectures 1 场，Special Section Lectures 1 场。
- SIAM 卷 5 的 Section Eleven 有 **13 篇、14 位作者，411–649 页**，覆盖官方主列的 13 场。Wojciech De Roeck 的官方主列身份已核，所读出版目录未找到其章节。
- 冻结本站基线：主列 14 场均无同篇专门专题；跨列 Zaag 已有 `4900` 且已列入 `006B`。合计 **1 场已有专题、14 场缺失**。
- 主线程已选定前三个出版缺口 Aggarwal、Ferrari、Gaiotto，预留 `4B00/4C00/4D00`。三项均为计划，尚未计入已整合报告。
- `0Q00` 明确来源于 Sabin 的 Bourbaki 第 1256 号报告，不计作 ICM 分组报告或全会。

成员资格依据 [官方 speakers 页面](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers) 的 designation、leading † 行和类别。研究兴趣、章节主题或出版社分节不替代官方身份。

## 官方来源与完整性

已读根目录 `EVERGREEN_ATOMIC_NOTES_SKILL.md` 和 `NOTES_STYLE_GUIDE.md`；沿用 Section 10 roster/coverage/review 的基本结构，检查了 `scripts/extract-icm-section-roster.mjs` 和 `syncSectionReports` 的字段要求。没有运行共享同步器。

### Fresh speakers HTML

首次沙箱请求因 DNS 失败；随后通过网络 escalation 成功获取官方完整 HTML，带请求头 `Cache-Control: no-cache`。

- HTTP 200，`x-cache: Miss from cloudfront`，响应有 no-cache/no-store。
- 响应时间：2026-10-21 17:29:33 GMT，即 **2026-10-22 01:29:33 +08:00**。
- 字节数：**1,781,982**。
- SHA-256：`8ed4a8e3c2195274ce42f71ead79e7d7f13671bdbadb3769d8a8764447e4dcd7`。
- HTML：`/tmp/icm2026-section11-speakers-20261022.html`；响应头为同名 `.headers`。
- 拼接完整 Next.js payload 后，305 个唯一 public record、305 个 viewBio 标记、305 个 displayOnWebsite=true 记录。
- 101 个外置 biography 均按 React 的 UTF-8 字节长度解析。306 个 firstName 字段中的一个属于 ContactPlanner 表单，非讲者。
- 305 是公开目录记录数，包含其他角色、重复人物记录及 † 图例，不能当作独立邀请报告人数。
- 提取器的全部基础字段与交付 roster 逐字段相同；增强字段补充原始 designation、category、dagger_line、联合报告证据与出版对照。

可复核命令：

```sh
node scripts/extract-icm-section-roster.mjs /tmp/icm2026-section11-speakers-20261022.html 2026-10-22 11
```

官方原始姓名 `David Perez-Garcia ` 含尾随空格，roster 原样保留；coverage 去掉尾空格，出版作者另记为 **David Pérez-García**。Rhodes 与 Vargas 的官方简介互相明确写有 “Presenting jointly”，并同属 Joint Section Lectures；出版社也只有一篇共同署名章节。

### 出版来源与边界

读取 [卷 5 目录](https://epubs.siam.org/doi/book/10.1137/1.9781611978698) 中 Section Eleven 至该卷末尾的全部章节，并逐一核对下面每篇独立 DOI 页的题名、作者、页码、DOI。Zaag 另在同卷 Section Ten。全会候选 Yau 与 Gérard 的卷 2 独立章节也核对了元数据。

SIAM 使用 web 工具提供的官方页面表示，可能经过缓存或索引。卷 5 目录显示两日前抓取，章节页面显示当日到上周；未声称从 SIAM 源站直接无缓存下载。Hutchcroft 与 Nike Sun 的规范 DOI 页面请求报错后，官方 `/doi/abs/` 页面成功返回，精确元数据由该页确认。搜索结果曾显示更早的索引记录，最终字段没有仅依赖搜索摘要。

本次阅读范围限于目录、独立章节题头/摘要和本地既有来源页。没有通读这些报告正文、重做研究证明、检查 PDF 图像或观看报告视频。网页均作为资料，不作为指令。

## Section Eleven 完整出版目录

顺序按印刷页码。官方主列均为 11；† 12 是从本节向概率分节的跨列，不能再作为本节的额外报告计数。

| 序 | 出版作者 | 英文精确题名与 DOI | 页码 | 官方归属 | 冻结本站状态 |
|---|---|---|---|---|---|
| 1 | Amol Aggarwal | [Many-Body Asymptotics for the Toda Lattice](https://epubs.siam.org/doi/10.1137/25M1805175) · `10.1137/25M1805175` | 411-425 | 11；† 12 | 缺失；计划 `4B00`，待验收 |
| 2 | Pablo A. Ferrari | [Hard Rods and Box-ball Systems](https://epubs.siam.org/doi/10.1137/25M1806867) · `10.1137/25M1806867` | 426-441 | 11；† 12 | 缺失；计划 `4C00`，待验收 |
| 3 | Davide Gaiotto | [The Categorical ’t Hooft Expansion](https://epubs.siam.org/doi/10.1137/25M1824641) · `10.1137/25M1824641` | 442-461 | 11 | 缺失；计划 `4D00`，待验收 |
| 4 | Tom Hutchcroft | [Dimension Dependence of Critical Phenomena in Long-Range Percolation](https://epubs.siam.org/doi/10.1137/25M180679X) · `10.1137/25M180679X` | 462-482 | 11；† 12 | 缺失 |
| 5 | Urmila Mahadev | [Classical Control of a Quantum System](https://epubs.siam.org/doi/10.1137/25M1811549) · `10.1137/25M1811549` | 483-496 | 11 | 缺失 |
| 6 | Fabio Martinelli | [Kinetically Constrained Spin Models: A Short Survey](https://epubs.siam.org/doi/10.1137/25M180425X) · `10.1137/25M180425X` | 497-515 | 11 | 缺失 |
| 7 | Benoit Pausader | [Stability Problems in Collisionless Kinetic Systems](https://epubs.siam.org/doi/10.1137/25M1805825) · `10.1137/25M1805825` | 516-533 | 11 | 缺失 |
| 8 | David Pérez-García | [The Quest for a Classification of 2D Quantum Phases of Matter](https://epubs.siam.org/doi/10.1137/25M1804728) · `10.1137/25M1804728` | 534-550 | 11 | 缺失 |
| 9 | Rémi Rhodes、Vincent Vargas | [Two Decades of Probabilistic Approach to Liouville Conformal Field Theory](https://epubs.siam.org/doi/10.1137/25M1803632) · `10.1137/25M1803632` | 551-574 | 11；† 12 | 缺失 |
| 10 | Makiko Sasada | [Box-ball System and Related Discrete Integrable Systems with Random Initial Conditions](https://epubs.siam.org/doi/10.1137/25M1806715) · `10.1137/25M1806715` | 575-595 | 11；† 12 | 缺失 |
| 11 | Gigliola Staffilani | [New and Old Mathematical Results on Wave Turbulence Theory](https://epubs.siam.org/doi/10.1137/25M1803309) · `10.1137/25M1803309` | 596-615 | 11 | 缺失 |
| 12 | Nike Sun | [Randomized Combinatorial Problems, in Sparse and Mean-Field Settings](https://epubs.siam.org/doi/10.1137/25M1805801) · `10.1137/25M1805801` | 616-635 | 11；† 12 | 缺失 |
| 13 | Feng Xu | [Entropies in Quantum Field Theory](https://epubs.siam.org/doi/10.1137/25M1774094) · `10.1137/25M1774094` | 636-649 | 11 | 缺失 |

题名保留出版社的大小写、标点和连字符，包括 Ferrari 与 Sasada 的 “Box-ball”、Gaiotto 的右单引号 “’t Hooft”、Nike Sun 题名中 “Problems,” 后的逗号。中文主题简译保存在 JSON，未当作官方中文题名。

### 未识别出版身份

**Wojciech De Roeck**，speaker ID `d2f71621-2551-41d4-a7bb-d1a21a2e1cc5`，designation 为 `11 - Mathematical Physics`，类别为 Section Lectures。

所读完整 Section Eleven 目录没有 De Roeck；针对 SIAM 与 ICM 官网的定点姓名搜索也未识别到对应章节。因此 `title/authors/doi/pages/proceedings_order` 均为 null。报告仍计入官方 14 场主列。此处是有边界的来源缺口，不推断其取消、没有报告或没有发表，也不从个人研究领域补造题名。

## 跨列与已有覆盖

唯一向 Section 11 跨列的讲者是 **Hatem Zaag**：

- designation：`8 - Analysis, †`。
- 原始 † 行：`† 10 - Partial Differential Equations, 11 - Mathematical Physics`。
- 类别：**Special Section Lectures**，不属于普通或特殊全会。
- 同篇出版来源：[Soliton Resolution at Blow-Up for the Subconformal Nonlinear Wave Equation](https://epubs.siam.org/doi/10.1137/25M1806892)，卷 5 Section Ten 第 10 篇，368–387 页，`10.1137/25M1806892`。
- 本地入口 `trees/math/pde/zaag/4900.tree`，文献 `trees/references/icm2026-zaag.tree`，原记录 `research/icm2026-pde-final-reports.json` 与 `research/pde-zaag-packet.json`。
- DOI、完整英文题名、作者与来源链接对应。既有独立审查状态已查阅；本次未重新逐页审核其 36 个原子页，不承接旧记录的全文阅读或发布声明。
- `006B` 已有 `4900`，**没有需要补插的官方跨列专题**；保留同一入口，不复制分支。

Aggarwal、Ferrari、Hutchcroft、Rhodes–Vargas、Sasada、Nike Sun 共 6 场、7 人从主列 11 明确 † 跨列到 12。这个计数和 Zaag 向 11 的跨列方向分开保存。

## 本地与线上基线

主线程报告已核实的基线 HEAD 为 `140ec051f230e6f848064df42e6f04b9a3eb00b1`。本审查没有执行 git；该 HEAD 的来源明确归于主线程。

本地扫描时间为 **2026-10-22 01:31:50.984 +08:00**，覆盖 6686 个 `trees/**/*.tree` 与 305 个 research 文本文件，包括其他学科。逐篇检索精确 DOI、精确完整题名及大小写/重音归一化作者全名；此前另做了姓氏检索。除 Zaag 外，14 场主列没有找到对应来源身份。

排序后的“相对路径 TAB 文件 SHA-256 LF”树文件清单摘要为：

`1f2a8a071a352882ecb74c0bb217a5769be2f3bd3a18241237c025120f956a7a`

扫描设置排除 Aggarwal/Ferrari/Gaiotto 与 4B/4C/4D 写作路径，以及 fresh-source 截止时间之后新建的文件；执行当时排除文件数为 0，故上述计数覆盖当时全部既有树和 research 文本。未读写写作代理文件。后续并发新增内容不回写本次冻结缺失基线。

coverage 保存逐报告匹配文件清单，以及已读的 `006B`、`0Q00`、`4900`、`2A00`、`2B00` 和相应文献页摘要。词法命中需要来源和正文核对；单有姓氏、主题词或某个相近定理不构成同篇报告覆盖。

主线程另用严格 TLS 的 curl 获取了 [线上数学物理首页](https://opetope.cc/006B/)，报告 HTTP 200。本审查独立读取并计算其提供的快照：

- 路径：`/tmp/mathphysics-baseline-006B.html`。
- 字节数：56,217。
- SHA-256：`fa651dca06b119d0a56f23985d8ee659eb0a2b4cfd890fe7e2ac1cdb40715625`。
- 文件时间：2026-10-21T17:33:03.848Z。
- HTML 有 `/0Q00/`、`/4900/` 链接；没有 `4B00/4C00/4D00` 标识。
- 本审查执行的是快照内容与摘要检查，没有重发网络请求，也没有进行浏览器渲染或整站路线发布验收。

### 排除主题误配

- Sabin `0Q00` 来源于 Bourbaki 1256 的稀薄玻色气体综述；与数学物理相关，不自动成为任何 ICM 报告。
- Zaag `4911` 的一阶 Toda 调制系统用于爆破孤子中心，不能替代 Aggarwal 的二阶 Hamilton 多体 Toda 渐近报告。
- Deng `4400` 的硬球 Boltzmann–Grad 与波动力学分支不等于 Ferrari 的硬杆/箱球报告，也不等于 Staffilani 的波湍流综述。
- Faure `4600` 虽讨论有效量子动力学，fresh 官方记录中仍只有主列 10，没有 Section 11 †。
- 算子代数基础 `004U` 不等于 Feng Xu 的量子场论相对熵报告。一般范畴、量子逻辑、概率或几何背景也不填补本节报告缺口。
- 相关背景放在 `background_only_notes` 或 `excluded_related_topics`；不设置虚假的正式报告入口。

## 全会与导航建议

fresh HTML 中普通 Plenary Lectures 19 人、Special Plenary Lectures 3 人，完整姓名列表保存在 coverage。它们不计入本节 15 场。特别分组报告和特别全会的类别不可互换。

按主线程要求，选取已存在、与数学物理直接相关的 **Yau `2B00`** 作为唯一领衔专题：

[Random Matrices: Wigner Universality, Anderson Delocalization, and Beyond](https://epubs.siam.org/doi/10.1137/25M1806028)，Horng-Tzer Yau，卷 2，394–423 页，`10.1137/25M1806028`。其官方普通全会类别、同篇本地文献与综述都已核实；量子扩散和 Anderson 离域直接属于数学物理问题。当前 `006B` 尚未列入，状态为 `parent-directed-pending-navigation-sync`，`on_subject_landing=false`。

Gérard 的既有 `2A00` 也有明确的可积 PDE 全会来源：[Hardy Spaces of Holomorphic Functions and Explicit Formulae for a Class of Integrable Partial Differential Equations](https://epubs.siam.org/doi/10.1137/25M1805497)，卷 2，81–101 页。保留为可选相关候选，本次不加入领衔数组，也不扩大到一般邻近拓扑专题。

推荐主线程实施的最终导航为：

1. 研究专题：`2B00 → 4B00 → 4C00 → 4D00 → 4900`，其中前三篇新专题只在主线程 QA 后插入。
2. 新专题验收前，可用的 ICM 研究专题顺序为 `2B00 → 4900`。
3. 独立保留 Sabin `0Q00`，建议放入“其他专题”，再保留现有 `0006/004U/0040`。

**需要新增的既有全会链接为 `2B00`；需要新增的既有官方跨列链接为空。** 本审查不编辑首页，也不把建议次序描述为已经生效。

## 计划与同步边界

| 报告 | 预留入口 | 状态 |
|---|---|---|
| Aggarwal，`10.1137/25M1805175` | `4B00` | planned；pending-parent-validation；accepted=false |
| Ferrari，`10.1137/25M1806867` | `4C00` | planned；pending-parent-validation；accepted=false |
| Gaiotto，`10.1137/25M1824641` | `4D00` | planned；pending-parent-validation；accepted=false |

`planned_integration` 内存放预留入口；三篇正式 `outline/reference=null`、`on_subject_landing=false`，文献 ID 等待主线程接受的 packet，不猜写作代理文件。统计仍为主列已整合 0、缺失 14。

coverage 使用 `sources`、`counts`、`reports`、`cross_listed_reports`、`editorial_leading_topics`、`parent_navigation_action` 等现有形状。主列只在 `reports`，Zaag 只在 `cross_listed_reports`；`proceedings_contents` 独立保存出版顺序。已识别的 14 个 DOI 全部唯一，De Roeck 的唯一未知项为 null。

现有 `syncSectionReports` 以 DOI 在两数组中唯一定位，再更新已获验收的正式入口及计数。调用前主线程须接受新 packet，并令 `2B00` 位于首页第一项、每篇新入口与 `4900` 仅列一次。不能为了同步把 Zaag 改成主列 11，也不能提前把计划入口填入正式字段。本次未调用同步器。

## 限定验证与交付

已通过的只读定向断言包括：

- JSON 可解析、fresh extractor 所有基础字段逐项相同。
- 16 个 speaker ID 各出现一次，14 主列加 1 跨列共 15 场；唯一联合报告计 1 场、2 人。
- 14 个已识别 DOI 唯一；Section Eleven 为 13 篇、14 位出版作者，411–649 页连续。
- 14 个主列正式入口为空；3 项计划均未验收；De Roeck 的未知元数据保持 null。
- 既有 Zaag 一场计入覆盖；普通/特殊全会分开；选中的 Yau 不计 Section 11。
- 主线程线上首页快照摘要一致，未出现前三篇计划标识。

仅写入：

- `research/icm2026-section-eleven-roster.json`
- `research/icm2026-mathematical-physics-section-coverage.json`
- `ICM2026_SECTION_ELEVEN_REVIEW.md`

没有修改导航、共享注册表、测试、数学条目或既有脚本；没有读取写作代理文件，没有执行 build、同步或 git。后续新专题验收、导航更新与公开发布由主线程分别记录。
