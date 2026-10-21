# ICM2026 Section 10 独立目录与本站覆盖核查

初次核查日期：2026-10-20（Asia/Shanghai）。以下分开记录当前整合状态与初次目录核查；后文的冻结基线计数不代表当前网站。

## 2026-10-21 的整合状态

重新抓取官方完整报告人目录后，Section 10 的主列、跨列和联合报告归属均与初次核查相同。主列10场、跨列4场，合计14场、16位报告人。SIAM 卷5 Section Ten 的11篇正文仍为193–407页。此次抓取和逐字段比较见 `research/icm2026-pde-final-directory-check.json`。

PDE 首页 `006A` 已列出全部14场分组报告。三个既有全会专题 `2A00/2700/2C00` 保持领衔，且不计入分组报告总数。Chodosh、Hong Wang、Zahl 直接复用既有专题，未复制其知识页。Zaag 仍登记为主列8、跨列10/11；同一专题 `4900` 同时进入分析、偏微分方程与数学物理首页。

| 整合批次 | 报告 | 专题入口 |
|---|---|---|
| 首批 | Armstrong–Kuusi、Berti、Cabré、Colombo | `4000/4100/4200/4300` |
| 第二批 | Yu Deng、Tarek Elgindi、Frédéric Faure | `4400/4500/4600` |
| 收尾批次 | Rowan Killip–Monica Vişan、Sung-Jin Oh、Hatem Zaag、Ping Zhang | `4700/4800/4900/4A00` |
| 复用的跨列专题 | Otis Chodosh、Hong Wang、Joshua Zahl | `2G00/1200/2I00` |

第二批提交 `700f236014ada9ae6ef6584e0f53d2b8847aea21` 已通过 GitHub Pages 构建与部署，131条线上路径与独立构建一致，详见 `research/icm2026-pde-second-release.json`。收尾批次已完成本地内容验收，待提交发布；后续上线状态单独记录，专题入口齐全不等于重现了所有研究论文的完整证明。

收尾批次新增167个原子知识页、4篇综述和4个文献页，登记559条直接前置关系。四篇均由作者之外的代理逐页复核，所有问题修订后已复验关闭；记录绑定当前源码摘要。40项工作流源码检查、6686页静态构建、84225处公式与50个图形资源检查通过。178页在1440/390两种宽度下的356项浏览器检查通过，包含搜索、跨学科导航、长公式滚动及旧链接兼容。验收记录为 `research/icm2026-pde-final-validation.json`。

收尾批次将初等推导、精确定理和研究级证明输入分开。对易流方法中的可积方程全局适定性、渐近平直时空上的尖锐波尾、爆破解的孤子分解、各向异性 Navier–Stokes 方程的关键非线性估计均逐页注明来源和适用假设。完整原论文证明未逐步重现的部分保存在各 packet 的 `unexpanded_deep_proofs` 中。

通用同步器现按唯一 DOI 在主列与跨列两数组中定位，拒绝缺失和重复 DOI，保留原始成员归属。对应测试覆盖 Zaag 的跨列身份、14场去重计数、每场唯一入口、前置关系无环、逐页源码与独立复核摘要一致。

## 首批整合记录（历史状态）

首四篇按论文集页码顺序完成本地整合，共新增172个原子知识页、4篇专题综述和4个文献页。完整原始题名、版本、来源、逐页证明范围与482条直接前置关系记于 `research/icm2026-pde-first-reports.json` 及四份 packet。

| 报告 | 本地入口 | 原子知识页 |
|---|---|---|
| Armstrong–Kuusi | [椭圆算子的粗粒化与高对比度均匀化](http://localhost:8083/4000/) | 42 |
| Berti | [周期水波的长时动力学](http://localhost:8083/4100/) | 40 |
| Cabré | [稳定反应扩散解](http://localhost:8083/4200/) | 47 |
| Colombo | [流体方程的非唯一性](http://localhost:8083/4300/) | 43 |

四篇综述已接入 `006A`，并复用三个已收录的跨列专题 `2G00/1200/2I00`。当前14场报告中7场有专题入口，另7场尚无专门专题。相关全会专题 `2A00/2700/2C00` 列在首页前部，不计入14场分组报告。

本地验收包括38项源码/结构检查、6388页静态构建、80141处公式、49个既有图形资源，以及181页在1440/390两种宽度下的362项浏览器检查。人工查看了首页、四篇综述及四个代表性证明页的桌面/手机截图。详细证据与对应源码摘要见 `research/icm2026-pde-first-validation.json`。

主线程阅读并复核四条分支；另由两位独立代理复核 Armstrong–Kuusi 与 Berti。发现的数学假设、公式来源和估计问题已修正，独立复核记录无未关闭问题。研究级输入和未重现的完整原论文证明仍逐页引用，不将结构检查或专题入口等同于所有研究证明已完整展开。香蕉空间访问未成功的术语核对也保留在各 packet 中。

上一批动力系统对应提交 `cf26da4c88b3301b5e07185fdd98c78b83168ef4` 的 GitHub Pages 已发布，380条线上路径与独立构建比对通过。本批 PDE 仅在本地整合和验收，未提交、未推送。

## 结论与口径

- 官方主列 Section 10：**10 场、12 人**，其中 Armstrong–Kuusi、Killip–Vişan 各为一场联合报告。
- 明确 † 跨列 Section 10：**4 场、4 人**，即 Chodosh、Hong Wang、Zaag、Zahl。
- 去重合计：**14 场、16 人**。联合报告按场计，不能把两位报告人计作两篇报告。
- SIAM 卷 5 的 **Section Ten 有 11 篇、13 位作者，页码 193–407**。它与官方主列名册不是同一个集合。
- 关键差异：**Zaag 官方主列 8，† 跨列 10/11；出版位置却是 Section Ten 第 10 篇**。coverage 中只在 `cross_listed_reports` 计一次，出版顺序表保留其位置；Ping Zhang 为出版第 11 篇。
- 本站基线：主列 10 场均无专门专题；跨列 3 场已有可复用专题，Zaag 未收录。共 3 场已有专门专题、2 场仅有具体相关分支、9 场缺失。11 场没有专门入口。
- PDE 首页 `006A` 在基线中仍为“暂未收录独立专题。”，已有跨列与全会专题均未列于该首页。

官方成员资格只依据 [ICM speakers](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers) 的 designation、明确 † 行及类别；研究领域简介、题名中的 PDE 或其他节的出版位置均不能替代这一证据。

## 来源与读取边界

已先读根目录 `EVERGREEN_ATOMIC_NOTES_SKILL.md`、`FORESTER_STERLING_DIAGRAM_SKILL.md`、`NOTES_STYLE_GUIDE.md`；参考 Section 9 roster/coverage、`scripts/extract-icm-section-roster.mjs` 和 `scripts/sync-lie-reports.mjs`。未运行会修改共享注册表的同步脚本。

### 官方 speakers：fresh 完整 HTML

首次沙箱 curl 因 DNS 限制失败，随后经网络 escalation 成功 GET。此次请求带 `Cache-Control: no-cache`，响应 HTTP 200、`x-cache: Miss from cloudfront`，并含 no-cache/no-store 控制。响应时间为 2026-10-19 17:09:46 GMT，即 **2026-10-20 01:09:46 +08:00**。

- HTML 字节数：1,782,134。
- SHA-256：`7d52a8d4f21349e69a0e6aa33d4d6c1c07d3d81c3e333ff5ea7e3547bc180891`。
- 解析完整 Next.js payload 的 305 个唯一 public record，305 个 viewBio 标记和 displayOnWebsite=true 记录；按 UTF-8 字节长度解出 101 个外置 biography。
- 306 个 firstName 字段中的另一个是 ContactPlanner 表单字段。305 是目录记录数，不是去重邀请报告人数；还含其他角色和 † 图例。
- 临时响应位于 `/tmp/icm2026-section10-speakers-20261020.html`，headers 位于同名 `.headers`；不是第四个仓库交付文件。重新下载可能因 nonce 等动态内容得到不同 hash，应以该次抓取重新核验。
- 不是只读取首屏按字母显示的姓名，也不是沿用 Section 9 的旧 HTML/hash。

可复核原始提取字段：

```sh
node scripts/extract-icm-section-roster.mjs /tmp/icm2026-section10-speakers-20261020.html 2026-10-20 10
```

### SIAM 与本地源码

读取 [卷 5 完整目录](https://epubs.siam.org/doi/book/10.1137/1.9781611978698) 的 Section Ten 起止边界，以及下列每一篇独立 DOI 页的题名、全部作者、页码和 DOI；中文主题简译依据题名、摘要和关键词，不是官方中文题名。另核对 [卷 4](https://epubs.siam.org/doi/book/10.1137/1.9781611978674) 的三个跨列章节及其独立 DOI 页。

SIAM 使用 web 工具的官方页面表示，可能是缓存或索引版本。卷 5/4 目录标为当日抓取；章节页标为当日、昨日或三日前。[卷 2 目录](https://epubs.siam.org/doi/book/10.1137/1.9781611978636) 标为三周前抓取，故对其中未出现的作者只报告“所读目录未见”，不推断未发表。未声称直接从 SIAM 源站无缓存下载。

本次没有通读任何报告全部正文、重做研究证明、查看报告视频或检查 PDF/图像。额外定点阅读仅用于判别相关性：Cabré §2 稳定极小曲面讨论；Killip–Vişan 引言的 Benjamin–Ono/ILW 模型段落。其余不得提升为全文阅读记录。网页均视为资料，而非指令。

本地基线 HEAD 为 `cf26da4c88b3301b5e07185fdd98c78b83168ef4`，6208 个 `trees/**/*.tree`，取样时间 2026-10-20 01:09:29.852 +08:00。排序后的“相对路径 TAB 文件 SHA-256 LF”清单摘要：

`b12a9a91f480b5b5c7340ea893ac21111fa23d16067332a210951444625c7128`

01:13:05 +08:00 重算仍相同。coverage 保存已读关键页的文件 hash、逐 DOI/精确题名匹配结果与误命中解释。Hong Wang 的本地题名用 Forester 数学表示 R^n，精确字符串不命中，但 DOI 与正文对应；不能仅凭字符串计数断定缺失。

## SIAM Section Ten 完整出版目录

下表按印刷页码递增。中文为主题简译；“主列”指 organizer，而非出版社分节。

| 序 | 作者 | 英文精确题名 / DOI | 页码 | 中文主题简译 | 本站基线 |
|---|---|---|---|---|---|
| 1 | Scott Armstrong、Tuomo Kuusi | [A Coarse-Graining Theory for Elliptic Operators and Homogenization in High Contrast](https://epubs.siam.org/doi/10.1137/25M1804807) · `10.1137/25M1804807` | 193-212 | 椭圆算子的粗粒化理论与高对比度均匀化 | 主列；缺失 |
| 2 | Massimiliano Berti | [Long Time Dynamics of Space Periodic Water Waves](https://epubs.siam.org/doi/10.1137/25M1802547) · `10.1137/25M1802547` | 213-233 | 空间周期水波的长时间动力学 | 主列；缺失 |
| 3 | Xavier Cabré | [Stable Solutions to Reaction-Diffusion Elliptic Problems](https://epubs.siam.org/doi/10.1137/25M1803978) · `10.1137/25M1803978` | 234-248 | 反应扩散椭圆问题的稳定解 | 主列；仅相关材料 |
| 4 | Maria Colombo | [Instability and Non uniqueness for the Euler and Navier–Stokes Equations](https://epubs.siam.org/doi/10.1137/25M1807010) · `10.1137/25M1807010` | 249-263 | Euler 与 Navier–Stokes 方程的不稳定性和非唯一性 | 主列；缺失 |
| 5 | Yu Deng | [Hilbert’s Sixth Problem: Particles and Waves](https://epubs.siam.org/doi/10.1137/25M1804406) · `10.1137/25M1804406` | 264-284 | 希尔伯特第六问题中的粒子与波 | 主列；缺失 |
| 6 | Tarek M. Elgindi | [Dynamics of Ideal Fluid Flows](https://epubs.siam.org/doi/10.1137/25M1807137) · `10.1137/25M1807137` | 285-306 | 理想流体的动力学 | 主列；缺失 |
| 7 | Frédéric Faure | [Can Quantum Dynamics Emerge from Classical Chaos?](https://epubs.siam.org/doi/10.1137/25M1805783) · `10.1137/25M1805783` | 307-327 | 经典混沌能否产生量子动力学 | 主列；缺失 |
| 8 | Rowan Killip、Monica Vişan | [The Method of Commuting Flows](https://epubs.siam.org/doi/10.1137/25M1807149) · `10.1137/25M1807149` | 328-347 | 交换流方法与可积 PDE 的适定性 | 主列；仅相关材料 |
| 9 | Sung-Jin Oh | [Long-term Behavior of Linear and Nonlinear Waves](https://epubs.siam.org/doi/10.1137/25M1807174) · `10.1137/25M1807174` | 348-367 | 线性与非线性波的长时间行为 | 主列；缺失 |
| 10 | Hatem Zaag | [Soliton Resolution at Blow-Up for the Subconformal Nonlinear Wave Equation](https://epubs.siam.org/doi/10.1137/25M1806892) · `10.1137/25M1806892` | 368-387 | 次共形非线性波方程爆破时的孤子分解 | 跨列；缺失 |
| 11 | Ping Zhang | [3-D Anisotropic vs. Classical Incompressible Navier–Stokes Equations](https://epubs.siam.org/doi/10.1137/25M1801980) · `10.1137/25M1801980` | 388-407 | 三维各向异性与经典不可压缩 Navier–Stokes 方程 | 主列；缺失 |

题名保留出版社的 **“Non uniqueness”**，不静默改为 Nonuniqueness 或 Non-uniqueness；“Long-term”的大小写与连字符照原页。Ping Zhang 题名仅把 `vs.` 后的不换行空格归一化为空格。官方姓名 Tarek Elgindi 对应出版作者 Tarek M. Elgindi；官方 Monica Visan 对应出版作者 Monica Vişan。

Armstrong 与 Kuusi 均在 Joint Section Lectures 类别，Kuusi 简介明确写与 Armstrong 联合报告；Armstrong 简介没有反向的 Presenting jointly 句子，记录中没有虚构双向声明。Killip 与 Visan 有双向联合声明。

## 明确跨列

| 报告人 | 官方主列与原始 † 行 | 出版章节 / 页码 / DOI | 本站 |
|---|---|---|---|
| Otis Chodosh | 5；† 10 - Partial Differential Equations | [Minimal Surfaces and Comparison Geometry](https://epubs.siam.org/doi/10.1137/25M1804340)，卷4 Section Five，82–102，`10.1137/25M1804340`；极小曲面与比较几何 | `2G00` / `icm2026-chodosh`，可复用 |
| Hong Wang | 8；† 10 - Partial Differential Equations | [Restricted Families of Orthogonal Projections in R^n](https://epubs.siam.org/doi/10.1137/25M1806156)，卷4 Section Eight，785–800，`10.1137/25M1806156`；受限正交投影族 | `1200` / `icm2026-hong-wang`，可复用 |
| Hatem Zaag | 8；† 10 - Partial Differential Equations, 11 - Mathematical Physics | 卷5 Section Ten，368–387，`10.1137/25M1806892`，见完整目录第10篇 | 无专门专题 |
| Joshua Zahl | 5；† 8 - Analysis, 10 - Partial Differential Equations, 13 - Combinatorics | [A Survey of the Kakeya Conjecture, 2000–2025](https://epubs.siam.org/doi/10.1137/25M1805965)，卷4 Section Five，270–287，`10.1137/25M1805965`；Kakeya 猜想进展 | `2I00` / `icm2026-zahl`，可复用 |

Chodosh、Hong Wang 为普通 Section Lectures；Zaag、Zahl 为 **Special Section Lectures，不是全会**。三篇既有专题的同篇来源和综述已核，不代表本次重审了其所有原子页或证明；复用到 PDE 首页仍须由主代理安排。

## 相关材料与缺口

- Cabré：`2G00/2G03/2G04` 的极小超曲面二阶变分、Jacobi 二次型和稳定性与本篇 §2 有具体交集，登记 related-material-only；未覆盖反应扩散稳定解九维正则性、分数 Laplace 或边界反应分支。
- Killip–Vişan：`2A00/2A03/2A04` 的 Lax 结构和 Benjamin–Ono 模型是具体相关材料，不能充当交换流方法的专门入口。
- Berti 的有限维 KAM 背景 `310M`、Deng 的自由 Schrödinger 背景 `130A`、Elgindi 的 Burgers 对比例子 `2A05`、Faure 的符号 Ruelle 算子背景 `330R`、Oh 的半波/局部光滑背景 `1112/1113` 均不升级为该篇覆盖。
- `0U0F` 中 Colombo–Edelen–Spolaor 的簇正则性引用不是 Colombo 的流体报告；数论“均匀化元”不是 Armstrong–Kuusi 的均匀化；Ruixiang Zhang 不是 Ping Zhang。
- Zaag 的非线性波爆破孤子分解不能以 Gérard 的另一类方程的长时间孤子分解代替。
- Seeger `1100`、Ruixiang Zhang `1300`、Haslhofer `2M00` 虽有 PDE 关联，官方无 Section 10 †，只可另作编辑导航建议，不计本目录。

## 四篇预留计划

| 出版序 | 报告 | 预留入口 | 预留文献 |
|---|---|---|---|
| 1 | Armstrong–Kuusi | `4000` | `icm2026-armstrong-kuusi` |
| 2 | Berti | `4100` | `icm2026-berti` |
| 3 | Cabré | `4200` | `icm2026-cabre` |
| 4 | Colombo | `4300` | `icm2026-colombo` |

四项只记 `planned_integration.stage=planned`、`status=pending-parent-validation`、`accepted=false`。正式 `outline/reference=null`，`on_subject_landing=false`；基线计数完全不变。代理写出文件、报告“完成”、构建成功或同步成功均不是主代理的数学内容验收。

## 全会另列与首页建议

fresh HTML 中普通全会 19 人、特殊全会 3 人，姓名分别保存在 coverage 的 `plenary_audit`。以下均不计 Section 10 的 14 场，首页适用性是本次编辑建议。

| 全会报告 | 出版元数据 | 已有入口 / 建议 |
|---|---|---|
| Patrick Gérard：[Hardy Spaces of Holomorphic Functions and Explicit Formulae for a Class of Integrable Partial Differential Equations](https://epubs.siam.org/doi/10.1137/25M1805497) | 卷2，81–101；`10.1137/25M1805497` | `2A00`；建议主代理优先复用。保留进行中结果的状态 |
| Xavier Tolsa：[Interactions between Quantitative Rectifiability, Singular Integrals, and Boundary Value Problems for Harmonic Functions](https://epubs.siam.org/doi/10.1137/25M1804054) | 卷2，313–340；`10.1137/25M1804054` | `2700`；已有边值问题与调和测度，建议复用 |
| Simon Brendle：[Hamilton’s Ricci Flow](https://epubs.siam.org/doi/10.1137/25M1799052) | 卷2，25–34；`10.1137/25M1799052` | `2C00`；几何演化方向可复用，保留 κ 解假设 |
| Horng-Tzer Yau：[Random Matrices: Wigner Universality, Anderson Delocalization, and Beyond](https://epubs.siam.org/doi/10.1137/25M1806028) | 卷2，394–423；`10.1137/25M1806028` | `2B00`；邻近谱方向，暂不建议首批领衔 |
| Jeremy Quastel：[The KPZ Fixed Point](https://epubs.siam.org/doi/10.1137/25M1805643) | 卷2，272–301；`10.1137/25M1805643` | 无本篇专门入口，仅未来候选 |
| Annalisa Buffa、Felix Otto | 全会类别已核；所读卷2目录未见其章节，题名/DOI/页码保留 null | 未见既有专题，不补造题名或链接 |

主线程在本轮明确决定首页顺序：`2A00,2700,2C00` 三个已有相关全会专题领衔，随后为通过验收的 `4000,4100,4200,4300`，最后复用跨列 `2G00,1200,2I00`。已按该顺序登记 `editorial_leading_topics`，明确这是编辑导航决定，不是官方 Section 10 报告。状态为 `parent-decided-pending-navigation-sync`；baseline 和全会候选的 `on_subject_landing` 保持不变，待主线程编辑后同步。本次没有变更首页、导航或共享注册表，也不把导航决定视为新报告验收。

## schema 与核验

沿用 Section 9 的 `reports`、`cross_listed_reports`、`counts`、`editorial_leading_topics`、`sources`、`baseline` 结构；新增 `proceedings_contents` 保存出版社完整页序，不能据此改写 organizer 主列字段。

`syncSectionReports` 以 DOI 在 `coverage.reports` 中定位主列报告，并按非空 outline 计已收录数，故本次计划入口只能放在嵌套 `planned_integration`。主代理以后同步首批前，应先完成内容验收，将获准的新专题和三篇复用跨列专题各列于 `006A` 一次，更新真正采用的全会领衔字段。当前通用函数只更新主列数组；未来 Zaag 集成须由主代理明确处理跨列条目，不能为适配函数把 Zaag 改成主列10。

本次限定核验：JSON 语法、fresh extractor 原始字段一致性、16个 speaker ID 一一归属、联合报告2场、14个唯一 DOI、出版11篇连续页序、四个预留计划不计已收录、既有入口/文献存在及 DOI 对应、本地证据 hash 与变更范围。未执行网站构建、共享同步或上线验证。

上述结构断言全部通过，`git diff --check` 通过。复核时检测到主线程已并发修改 `trees/006A.tree`；记录的旧 hash 仍与基线 commit 中该文件一致，故保留冻结 baseline，不回写当前导航状态，不将外部修改视为本代理交付。

## 交付范围

仅写入：

- `research/icm2026-section-ten-roster.json`
- `research/icm2026-pde-section-coverage.json`
- `ICM2026_SECTION_TEN_REVIEW.md`

未改首页、共享注册表、数学条目或既有脚本；未提交、未推送。原有 theme 与不相关未跟踪内容不作处理。
