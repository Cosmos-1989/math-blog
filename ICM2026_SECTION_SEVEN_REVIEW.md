# Lie 理论及其推广报告目录

核对日期为 2026 年 10 月 18 日。以 [ICM 官方讲者目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)确定所属 section，以 [论文集第四卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978674)确定文章题名、作者、页码和 DOI。网页首次显示的字母序列表不完整，核对使用全部 305 条公开讲者记录，包括另行引用的简介文本。

Section 7 有 8 场本节报告、9 位讲者。另有 5 场明确跨列到本节的报告、7 位讲者。合计 13 场、16 位讲者；联合报告按一场计算。全会报告与站内其他相关专题不计入上述数字。

## 本节报告

| 讲者 | 论文集文章 | 页码 | 本次安排 |
| --- | --- | --- | --- |
| David Ben-Zvi、David Nadler | [Potent Categorical Representations](https://doi.org/10.1137/25M1806934) | 471–491 | 首批已发布，2S00 |
| Ben Davison | [BPS Cohomology in Geometry and Representation Theory](https://doi.org/10.1137/25M1810234) | 492–512 | 首批已发布，2T00 |
| Jessica Fintzen | [Reduction from Representations of p-adic Groups to Representations of Finite Groups](https://doi.org/10.1137/25M1807058) | 513–531 | 首批已发布，2U00 |
| David Hernandez | [Representations and Characters of Quantum Affine Algebras at the Crossroads between Cluster Categorification and Quantum Integrable Models](https://doi.org/10.1137/25M1802614) | 532–551 | 第二批本地完成，2V00 |
| Friedrich Knop | [Group Schemes and Momentum Maps](https://doi.org/10.1137/25M1811823) | 552–564 | 第二批本地完成，2W00 |
| Thomas Lam | [The Combinatorial Geometry of Particle Physics](https://doi.org/10.1137/25M1804959) | 565–585 | 第二批本地完成，2X00；复用于组合学 |
| Anton Mellit | [Hard Lefschetz Phenomena and Lie Algebra Actions in Various Contexts](https://doi.org/10.1137/25M1807095) | 586–601 | 待整理；现有 P=W 页面可复用 |
| Yongchang Zhu | [Representations and Automorphic Forms of Loop Groups](https://doi.org/10.1137/25M1805461) | 602–615 | 待整理 |

Ben-Zvi–Nadler 文章说明新内容来自与 Germán Stefanich 的合作；这不增加官方报告的讲者人数。文章中的 potent Langlands 对应保留猜想状态。

## 跨节报告

| 讲者 | 主节及其他节 | 复用专题 |
| --- | --- | --- |
| Pramod Achar、Simon Riche | 2，另列 7 | 0181，约化代数群的倾斜模 |
| Uri Bader | 5，另列 7、9 | 2D00，格的高阶性质 T |
| Tom Braden、Nicholas Proudfoot | 2，另列 4、7、13 | 01C0，无空间的交上同调 |
| Sam Raskin | 4，另列 7 | 0BJ0，几何朗兰兹与 Arthur–Ramanujan 参数 |
| Andrew Snowden | 2，另列 5、6、7 | 014Z，寡轨群与张量范畴 |

五个专题均已在站内，无需另建同题页面。Bader 和 Raskin 的专题此前未列于 0067，本次补入。Gaitsgory 的全会专题 2400 复用于本学科首页首位，这是站内的数学归类，并非官方将全会报告划入 Section 7。模型论群和建筑保留在“其他专题”中。

## 内容与核查记录

- `research/icm2026-section-seven-roster.json` 保留官方讲者身份、主节、跨节与联合报告信息，以及来源散列值。
- `research/icm2026-lie-section-coverage.json` 记录本地收录进度。是否上线另见每批的发布记录。
- `research/lie-*-packet.json` 分别记录实际阅读范围、逐条来源、证明范围、前置关系和后续分支。
- `research/icm2026-lie-first-reports.json`、`research/icm2026-lie-second-reports.json` 与相应 snapshots 文件记录两批的页面和依赖；只更新各批条目，不重算旧页面的数学前提。
- 收录专题不等于重写该报告所引的全部研究证明。正文区分直接证明、以所引定理为输入的推导、引用结果与猜想；未展开的深层证明保留在对应阅读记录中。

## 首批结果

2026 年 10 月 19 日完成首批整合与发布。Ben-Zvi–Nadler、Davison、Fintzen 三个专题分别新增 42、40、40 个知识页，另有三篇综述和三篇文献页，共 128 个新页面。五篇已有跨节报告复用于 Lie 首页。

三条分支共登记 503 条正文前置关系。原有 4,926 页的前置记录保持不变。独立数学复核补正了 AFMO Hecke 比较中的正规化条件；表示叠的好模空间与简单、稳定对象的粗模空间也作了区分。

32 组源文件检查全部通过。全站 5,493 页静态构建、65,968 处公式及内部链接检查通过。关闭浏览器 XSLT 后，以 1,440 与 390 像素宽度检查 Lie 首页和全部新增页面，共 258 次页面检查；搜索、长公式滚动及旧链接跳转均通过。八张首页、专题截图已人工查看。

本地检查见 `research/icm2026-lie-first-validation.json`，发布核对见 `research/icm2026-lie-first-release.json`。提交 `a152a68976d376efe0cc0c41b0f36d4ff420c435` 的 GitHub Pages 工作流 39144526895 已成功。128 个新增页面、学科首页及三个旧 XML 地址共 132 个线上文件，与该工作流实际发布产物逐字节一致；HTTPS 证书校验正常。另以干净目录独立重建该提交，32 组源检查通过；排除标签和公式块之间的排版空白后，上述 132 个文件也全部一致。入口为 [Lie 理论及其推广](https://opetope.cc/0067/)。

## 第二批结果

2026 年 10 月 19 日完成 Hernandez、Knop、Lam 三个专题的本地整合，分别新增 39、35、40 个知识页，另有三篇综述和三篇文献页，共 120 个新页面。三篇综述分别从谱参数与张量分解、动量纤维与根数据、几何边界与散射振幅组织叙述。Lam 专题同时列入组合学首页，复用同一组页面。

新增 380 条正文前置关系，原有 5,048 页的前置记录不变。复核修正了 Drinfeld 与 Chevalley 参数约定、形式迹的完备化变量、球面簇乘法差的拟仿射条件及半不变量微分的 Lie 代数范围。一般振幅体的正几何性质仍列为猜想，实正拟阵胞腔闭包与复正拟阵簇也分别说明。

33 组源检查、全站 5,613 页静态构建、68,119 处公式检查均通过。两个学科首页及全部新增页面在 1,440 与 390 像素宽度下共完成 244 次浏览器检查，搜索、旧链接跳转和 71 处长公式滚动通过。十张截图已逐张查看。详细结果见 `research/icm2026-lie-second-validation.json`。

第二批尚未提交或发布，可在 [本地 Lie 首页](http://localhost:8083/0067/) 预览。当前本地已覆盖 6 场主节报告与 5 场跨节报告，尚待整理 Anton Mellit 和 Yongchang Zhu 两场。每篇 packet 单列尚未展开的研究证明，专题入口已存在不表示全部深层分支均已完成。
