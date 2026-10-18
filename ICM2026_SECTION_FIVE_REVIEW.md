# ICM2026 几何学报告目录与本站收录

核查日期为 2026 年 10 月 18 日。这里的几何学是 Section 5，与 Section 4
“代数几何与复几何”分开统计。

## 目录依据

- [大会报告人目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)。公开页面的首屏只显示部分字母段；本次读取其完整公开数据中的 305 条记录，同时检查主学科与个人简介开头的交叉学科标记。
- [论文集第四卷](https://epubs.siam.org/doi/10.1137/1.9781611978674)，Section Five，页 3–287。下表采用正式论文集标题；现场讲题的措辞可能不同。
- 完整抽取结果、源页面散列与报告对应关系保存在 `research/icm2026-section-five-roster.json` 和 `research/icm2026-geometry-section-coverage.json`。

## 主列报告

主列共有 16 位报告人、15 场报告。Daskalopoulos 与 Mese 合讲一场。

| 报告人 | 正式论文集标题 | 专题编号 |
| --- | --- | --- |
| Denis Auroux | Lagrangian Floer Theory, from Geometry to Algebra and Back Again | `0BL0` |
| Uri Bader | Higher Property T and Below-Rank Phenomena of Lattices—An Extract | `2D00` |
| Jacob Bernstein | Complexity of Submanifolds, Mean Curvature, and Singularities | `2E00` |
| Richard (Dick) Canary | Kleinian Viewpoints on Higher Rank Worlds | `2F00` |
| Otis Chodosh | Minimal Surfaces and Comparison Geometry | `2G00` |
| Georgios Daskalopoulos、Chikako Mese | Harmonic Maps in Singular Geometry and Rigidity | `2J00` |
| John B. Etnyre | Submanifolds in Contact Geometry | `2K00` |
| Ailana Fraser | Stability Theory for Minimal Surfaces | `2L00` |
| Robert Haslhofer | Mean Curvature Flow through Singularities | `2M00` |
| Kei Irie | Strong Closing Lemmas in Hamiltonian Dynamics | `2H00` |
| David Witt Nyström | Two Calabi–Yau Theorems for Degenerations of Compact Kähler Manifolds | `2N00` |
| Joaquín Pérez | Minimal Surfaces of Finite Genus: Classification, Dynamics and Laminations | `2P00`，本轮增补 |
| Jean-Marc Schlenker | Volume Functions and Boundary Data of 3-Dimensional Hyperbolic Manifolds | `2Q00`，本轮增补 |
| Valentino Tosatti | Ricci-Flat Metrics on Calabi–Yau Manifolds | `2R00`，本轮增补 |
| Joshua Zahl | A Survey of the Kakeya Conjecture, 2000–2025 | `2I00` |

## 交叉列入

另有 4 位报告人、3 场报告交叉列入几何学，均复用已有专题。

| 报告人 | 主学科 | 正式论文集标题 | 专题编号 |
| --- | --- | --- | --- |
| Rachel Greenfeld | 逻辑 | Translational Tilings: Structured or Wild? | `007C` |
| Laura Monk、Frédéric Naud | 数论 | Spectral Gaps on Large Hyperbolic Surfaces | `0GS0` |
| Andrew Snowden | 代数 | Oligomorphic Groups and Tensor Categories: A Summary | `014Z` |

合并后为 20 位报告人、18 场报告。Simon Brendle 与 Ngaiming Mok 的全会专题
分别为 `2C00`、`2600`，在学科首页排在最前，不计入分组报告数。Emanuel
Milman 的 `0U00` 是按数学内容添加的交叉入口；Bourbaki 的 `0N00` 也不计入
大会分组报告数。

## 本轮范围

发布前基线为 `e4722e2`。基线已有 12 场主列与全部 3 场交叉列报告的专题，
尚缺 Pérez、Schlenker、Tosatti 三场。本轮为这三场增补综述、原子条目、必要
前置定义、逐步推导和文献页，保留既有概念的稳定地址。

三份 `research/geometry-*-packet.json` 分别记录实际阅读位置、主要分支、
站内证明、调用的外部结果及尚未展开的研究证明。专题入口齐全表示每场报告
均可由学科首页进入，不表示各篇参考文献中的所有深层证明都已在站内重建。
自动化检查验证地址、依赖关系、来源快照和排版；数学结论另按原文假设及
推导逐项核对。最终构建与发布检查记录在
`research/geometry-final-reports-validation.json`。
