# ICM2026 数论报告增补记录

日期：2026-10-13。此次在 Balakrishnan、Blomer 两个既有专题之外，增加其余十场数论报告的专题入口、主要结果、基础概念和可独立展开的证明。数论导航为 `0063`。

本轮新增 266 页，其中专题综述 10 页、知识条目 244 页、参考文献 12 页。已有基础概念直接链接，未为每场报告复制一套定义。

## 专题与来源

| 报告人 | 入口 | 本轮数学内容 | 来源记录 |
| --- | --- | --- | --- |
| Frank Calegari、Vesselin Dimitrov、Yunqing Tang | `0GC0` | 算术 holonomy、有效高度、无理性度量 | `research/number-theory-modularity-approximation.json` |
| Toby Gee | `0G80` | 阿贝尔曲面、Galois 表示、模性提升 | 同上 |
| Adam Harper | `0GG0` | 随机乘法函数、分数矩、特征标和 | `research/number-theory-probability.json` |
| David Harvey | `0H00` | 累积余数树、矩阵递推、有限域点计数 | `research/number-theory-computation.json` |
| Laura Monk、Frédéric Naud | `0GS0` | 随机双曲曲面、覆盖、新谱与谱隙 | `research/number-theory-combinatorics-spectra.json` |
| Paul Nelson | `0H40` | 标准 L 函数、轨道法、局部量子化与次凸界 | `research/number-theory-orbit-method.json` |
| Sarah Peluse | `0GO0` | 多项式配置、差分、均匀性与次数降低 | `research/number-theory-combinatorics-spectra.json` |
| Will Sawin | `0GK0` | 随机欧拉乘积、随机矩阵、类群分布 | `research/number-theory-probability.json` |
| Michael Stoll | `0G00` | 亏格二秩一曲线、Mordell–Weil 筛与终止条件 | `research/number-theory-rational-points.json` |
| Xinyi Yuan | `0G40` | 规范高度、算术相交、有理点数量的一致界 | 同上 |

正式目录按十二场主数论报告计算，联合报告只算一场。Greenfeld 等交叉专题继续保留在“其他专题”，不重复生成入口。Monk–Naud 的同一专题也链接到 `0064`、`0065`，没有复制正文。

## 来源和证明的范围

十一场报告在 SIAM 论文集有章节，包括此前收录的 Balakrishnan、Blomer。各研究记录分别记载实际读过的正文、版本、补充论文、许可与未展开分支；公开参考页面提供可追溯的原文链接。下载的全文仅作为本地阅读副本，不加入 Git。

Nelson 的官方报告题目已核对，但未找到对应论文集章节。`0H40` 依据作者的 *Bounds for standard L-functions* 指定部分及 2021 年 MIT 同题讲义整理。2021 年讲义没有被标作 ICM2026 讲义，作者网页与 arXiv 版本也分别记载。

每个新专题以连续数学叙述组织，再链接到定义、定理、推导与算例。原有 Jacobian、Chabauty、局部域、自守表示、测度与线性代数页面直接复用。前置边只记录真正用于理解陈述或证明的知识；后续应用及专题间导航不作为证明依赖。

共用定义 `0BF1`、`0BF4`、`0BGJ` 已从复数域表述扩充到一般域，分别核对 Stacks Project 与阿贝尔簇对偶理论的来源，保持原地址。独立复核发现的局部量子化 Fourier 核符号已修正；Whittaker 模型词条明确限定非阿基米德情形，酉扭转推导补齐了次数、指数范围与局部积分移位计算。

覆盖谱分解的复核补入了闭算子、核心、自伴性、谱和核心交换引理 `0GSM` 至 `0GSQ`。`0GS8` 现在从紧支撑光滑函数上的交换延伸到闭包定义域，再证明旧、新部分的自伴限制。完备流形拉普拉斯算子的本质自伴性仍为注明出处的外部定理，未把局部微分算子的形式等式当作全定义域上的证明。

局部写出的证明与引用的研究定理分开记录。深层模性提升、算术相交理论、谱隙主定理、次凸估计和一般点计数算法的完整研究证明仍由原文提供。相应页面保留假设与出处，研究记录列出未展开部分。猜想、条件结论与已证明结论分别陈述。

香蕉空间的部分页面无法访问；既有译名优先复用，未验证的术语在各研究记录中保留状态。

## 整合与检查

`scripts/sync-number-theory-expansion.mjs` 合并本轮六组记录，仅注册本轮新页与变动导航，不用旧同步脚本覆写此前核查过的前置关系。

- `scripts/check-site-notes.mjs` 检查全站链接、可达性、前置有向无环图与生成结果。
- `scripts/check-note-prerequisites.mjs` 检查已核对的必要链接与源文件快照；词语扫描的候选项需另作语义判断。
- `scripts/check-number-theory-notes.mjs` 检查十二场专题覆盖、引用页、来源范围与快照。
- `tests/number-theory-computation.test.mjs` 独立检验累积余数树、递推及有限域算例。
- `tests/number-theory-render.test.mjs` 检查本地桌面、移动端页面与公式显示。

实际执行结果写入 `research/number-theory-verification.json`。程序检查与有限算例不能替代研究定理的数学证明。

本地 Chrome 对现有 XML/XSLT 渲染方式显示弃用警告。当前页面仍可渲染，正文、公式和导航在本次预览中工作正常；静态 HTML 迁移不在本轮数学内容增补范围内，未通过隐藏提示掩盖这一兼容性问题。本轮尚未提交或推送。
