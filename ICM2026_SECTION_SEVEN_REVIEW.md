# Lie 理论及其推广报告目录

目录核对日期为 2026 年 10 月 18 日，收录状态更新于 10 月 19 日。以 [ICM 官方讲者目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)确定所属 section，以 [论文集第四卷](https://epubs.siam.org/doi/book/10.1137/1.9781611978674)确定文章题名、作者、页码和 DOI。网页首次显示的字母序列表不完整，核对使用全部 305 条公开讲者记录，包括另行引用的简介文本。

Section 7 有 8 场本节报告、9 位讲者。另有 5 场明确跨列到本节的报告、7 位讲者。合计 13 场、16 位讲者；联合报告按一场计算。全会报告与站内其他相关专题不计入上述数字。

## 本节报告

| 讲者 | 论文集文章 | 页码 | 本次安排 |
| --- | --- | --- | --- |
| David Ben-Zvi、David Nadler | [Potent Categorical Representations](https://doi.org/10.1137/25M1806934) | 471–491 | 首批已发布，2S00 |
| Ben Davison | [BPS Cohomology in Geometry and Representation Theory](https://doi.org/10.1137/25M1810234) | 492–512 | 首批已发布，2T00 |
| Jessica Fintzen | [Reduction from Representations of p-adic Groups to Representations of Finite Groups](https://doi.org/10.1137/25M1807058) | 513–531 | 首批已发布，2U00 |
| David Hernandez | [Representations and Characters of Quantum Affine Algebras at the Crossroads between Cluster Categorification and Quantum Integrable Models](https://doi.org/10.1137/25M1802614) | 532–551 | 第二批已发布，2V00 |
| Friedrich Knop | [Group Schemes and Momentum Maps](https://doi.org/10.1137/25M1811823) | 552–564 | 第二批已发布，2W00 |
| Thomas Lam | [The Combinatorial Geometry of Particle Physics](https://doi.org/10.1137/25M1804959) | 565–585 | 第二批已发布，2X00；复用于组合学 |
| Anton Mellit | [Hard Lefschetz Phenomena and Lie Algebra Actions in Various Contexts](https://doi.org/10.1137/25M1807095) | 586–601 | 第三批，2Y00 |
| Yongchang Zhu | [Representations and Automorphic Forms of Loop Groups](https://doi.org/10.1137/25M1805461) | 602–615 | 第三批，2Z00 |

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
- `research/icm2026-lie-first-reports.json`、`research/icm2026-lie-second-reports.json`、`research/icm2026-lie-third-reports.json` 与相应 snapshots 文件记录三批的页面和依赖；只更新各批条目，不重算旧页面的数学前提。
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

第二批已于 2026 年 10 月 19 日发布，提交为 `9292c6dac61f035b4038e5d87a05f61cae47f751`。GitHub Pages 工作流 39175623038 成功。120 个新增页面、两个学科首页及三个旧 XML 地址，共 125 个线上文件，与该工作流的实际发布产物逐字节一致，HTTPS 证书校验正常。干净目录独立重建也通过 33 组源检查和 244 次浏览器页面检查；排除跨平台序列化的排版空白后，125 个文件与 CI 产物一致。发布记录见 `research/icm2026-lie-second-release.json`。

## 第三批结果

Mellit、Zhu 两个专题分别新增 40、39 个知识页，另有两篇综述和两篇文献页，共 83 个新页面。Mellit 从本原分解和主三元组进入几何 Satake、对角余不变量、辫子簇及 Higgs 上同调；Zhu 从回路与仿射根系进入 Eisenstein 级数、Hecke 理论、Weil 表示、theta 提升及拓扑顶点代数。两篇均以连续数学叙事连接原子条目。

登记 190 条正文前置关系，原有 5,162 页的前置记录保持不变。P=W、仿射 Grassmannian、环 Lie 代数、中心扩张及自守形式等内容直接复用。复核补正了递增滤过的编号、Hamilton 符号、作用代数的中心及子代数范围，并补入普通互素稳定 Higgs 模空间上的最终作用；Zhu 分支补齐了诱导特征标在有理点上平凡的条件，核正了来源节号。射影直线扭曲 Higgs 的有理函数模型及一般链环的作用延拓保留猜想状态。

34 组源检查、全站 5,696 页静态构建和 69,817 处公式检查通过。关闭浏览器 XSLT 后，Lie 首页与全部新增页面在 1,440 和 390 像素宽度下共完成 168 次页面检查，搜索、专题导航和旧链接跳转均通过。六张桌面及手机截图已逐张查看。验收结果见 `research/icm2026-lie-third-validation.json`。

逐页来源、可直接证明的结果与外部深定理分别记于两个 packet；每篇另列未展开的研究证明。本批的公开入口为 [Mellit 专题](https://opetope.cc/2Y00/)、[Zhu 专题](https://opetope.cc/2Z00/) 与 [Lie 首页](https://opetope.cc/0067/)。验收文件保留发布前的状态；部署结果以该提交的 GitHub Pages 工作流及线上核对为准。至此，全部 8 场本节报告及 5 场跨节报告均有专题入口，这一目录覆盖不表示所有深层证明均已重写。
