# 四个学科的报告收录核查

核查日期为 2026 年 10 月 13 日。

## 依据与统计范围

以 [ICM2026 官方报告人目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)确认学科归属、交叉报告及联合报告，以 [论文集卷三](https://epubs.siam.org/doi/10.1137/1.9781611978650)和 [卷四](https://epubs.siam.org/doi/book/10.1137/1.9781611978674)核对文章目录。联合报告按一场计；同一专题在不同学科复用，不另建副本。不计大会报告、讨论会、短报告与卫星会议。

本次重新读取官方页面四个学科的检索结果。逻辑、代数、数论、代数与复几何分别返回 10、15、16、18 位报告人。联合报告分组后，结果如下。

| 学科 | 主归属报告 | 交叉报告 | 应有专题 | 本站专题入口 |
| --- | ---: | ---: | ---: | ---: |
| [逻辑](https://opetope.cc/0061/) | 8 | 0 | 8 | 8 |
| [代数](https://opetope.cc/0062/) | 11 | 1 | 12 | 12 |
| [数论](https://opetope.cc/0063/) | 12 | 1 | 13 | 13 |
| [代数与复几何](https://opetope.cc/0064/) | 11 | 4 | 15 | 15 |

共 48 个学科入口，对应 43 场不同的报告。逐场报告人、学科归属及页面编号见 `research/icm2026-section-coverage.json`。

## 发现与处理

- 未发现整场专题缺页。每场都有专题提纲和来源页面。
- Rachel Greenfeld 的报告同时归属逻辑、代数和数论。数论原登记只统计 12 场主归属报告；其页面 `007C` 已有内容，但列在“其他专题”。现移入数论的“研究专题”，并增加跨学科复用记录。
- 几何的四场交叉报告为 Denis Auroux、Tom Braden 与 Nicholas Proudfoot、Laura Monk 与 Frédéric Naud、Anastasia Stavrova。四者均已收录。
- Michael Wemyss 与 Raf Cluckers 的专题在几何中有重要关联，但官方没有将其列入第四节。保留既有页面与入口，移到几何的“其他专题”，使四个学科的分组口径一致。
- Junliang Shen、Junyi Xie、Ziquan Zhuang 的三个专题及配套笔记已在本地完成上一轮整合；核查开始时尚未提交，本次发布一并纳入。
- 增加四学科目录检查，并把数论、几何加入专题分组检查。检查要求全部正式归属专题恰好出现一次，来源页存在，联合报告人分组一致，交叉报告沿用原页面。

## 文本与证明的收录范围

“有专题页面”不等于“报告全文及全部证明均已展开”。本次核对目录、来源登记与导航，没有重新逐句审阅四十余篇论文及其参考文献。

Paul Nelson 的 `0H40` 是需要单独保留的来源缺口。官方目录列有报告人，卷三数论目录仍没有对应文章。本站按已识别的作者研究论文及较早同题讲义展开专题，不能记作已收录一篇确定的 ICM 论文集文本。当前 43 个专题中，42 个有对应论文集文章，另 1 个为上述报告主题。

各学科已有登记仍保留未展开的分支和外部证明输入。例如，代数的广义约化群局部整体原理与部分表示论分类证明，数论的模性提升、等分布和高秩谱估计证明，几何的分解定理、P=W、动力 André–Oort 及稳定退化深层证明，并未因本次目录核查而变为本地完整证明。

详细范围分别见 `research/icm2026-algebra.json` 的 `coverage`、`limitations`，`research/icm2026-number-theory.json` 的 `not_expanded`、`deferred`，以及 `research/icm2026-geometry.json` 与 `research/geometry-{shen,xie,zhuang}.json` 的证明与待展开记录。逻辑的旧登记主要给出页面对应关系，没有同样细致的逐节证明覆盖表，后续内容核查应补足这一层记录。

## 可重复检查

```sh
node scripts/check-icm-section-coverage.mjs
node scripts/check-subject-navigation.mjs
node scripts/check-logic-notes.mjs
node scripts/check-algebra-notes.mjs --source-only
node scripts/check-number-theory-notes.mjs
node scripts/check-geometry-notes.mjs
node scripts/check-note-prerequisites.mjs
node scripts/check-site-notes.mjs --source-only
node scripts/build-site.mjs
```

目录检查核对的是本次保存的官方名单。未来报告目录变化时，需要重新读取官方来源并更新名单，单独运行脚本不能发现远端的新变化。
