# Bourbaki 2026 年六月报告整合记录

核对日期为 2026-10-13。本记录位于网站正文之外，用于保存来源、阅读范围和验证结果。

## 场次与入口

[官方日程](https://www.bourbaki.fr/seminaires/2025-26/index.html)列出 2026-06-06 的四场报告。[协会首页](https://www.bourbaki.fr/)将下一场列为 2026-11-21，因此本次采用最近已经举行的六月场次。

| 报告 | 讲者 | 站内专题 | 新页面 |
| --- | --- | --- | --- |
| 1253 | Guillaume Aubrun | `0N00` 高维球堆积 | 40 个内容页及 1 个文献页 |
| 1254 | Anna Florio | `0P00` 解析伪旋转 | 41 个内容页及 1 个文献页 |
| 1255 | Bram Petri | 扩充原 `0GS0` 大型双曲曲面的谱隙 | 23 个原子页及 1 个文献页 |
| 1256 | Julien Sabin | `0Q00` 稀薄玻色气体 | 36 个内容页及 1 个文献页 |

共新增 144 页，其中 137 个知识条目、3 个专题综述、4 个文献页。另改写原有 `0GS0`，修正 `0GS9` 的 Mirzakhani 常数，并更新六个学科入口。既有 ICM 专题地址、知识条目和网站样式均保留。

## 阅读范围

- Aubrun 使用 [arXiv:2606.13313v1](https://arxiv.org/abs/2606.13313v1) 的 17 页英文译本，已通读；Klartag [v2](https://arxiv.org/abs/2504.05042v2) 正文第一至第五节已读，附录未通读。未将英文稿等同于未取得的官方法文版本。
- Florio 使用[作者提供的 31 页报告](https://annafloriomath.wordpress.com/wp-content/uploads/2026/07/exp1254-florio.pdf)，已通读；Berger I、II 按研究记录选读。解析环带、球面和圆盘的结论分别保留各自假设。
- Petri 选读 [arXiv:2607.06331v1](https://arxiv.org/abs/2607.06331v1) 的背景与第六至第八节相关部分，第八节通读；另核对 HMT 与 Hide–Magee 原论文中的相应定理和推导。集成时另找到了[官方 62 页版本](https://www.bourbaki.fr/TEXTES/Exp1255-Petri.pdf)，仅检查标题、目录和开头；本次数学页的节号仍采用已读的 63 页 arXiv v1。
- Sabin 的[官方 29 页报告](https://www.bourbaki.fr/TEXTES/Exp1256-Sabin.pdf)已通读，Fournais–Solovej I、II 和上界论文按记录选读。2026 年九月一般势上界预印本单列为 `0Q0M`，未追溯归入六月报告。

逐来源的版本、页面范围、文件哈希与未展开分支保存于 `research/bourbaki-2026-06-{aubrun,florio,petri,sabin}.json`。总索引为 `research/bourbaki-2026-06.json`。

## 数学核对

74 页包含本地展开的论证，其中 21 页的推导显式调用外部定理。另登记 30 页含有未在本地证明的研究或分析输入。这个分类不表示已经重证四份报告的所有结果。

- 球堆积核对了最短向量、余体积、Rogers 平均、接触约束、对数行列式以及最终的二次因子。Siegel 平均、布朗演化和随机分析估计保留精确引用。
- 双曲曲面核对了新旧谱、固定误差与多项式误差的量词差别、迹归一化、重复测地线的权重、分布支撑和粘柄的极限形式。`0GS9` 的常数改为 `(1/4)(log 2/(2 pi+log 2))^2`。HMT 的模空间展开及粘柄定理仍为外部输入。
- 伪旋转核对了 Hamilton 符号、剪切换位子的二阶项、极限可逆性、周期点排除、保面积整直与球面不动点的不稳定性。Berger 的深层存在与实现定理保留引用身份。
- 玻色气体核对了两体动能、散射长度、硬核约束、Born 系数、双模配方、LHY 积分和相干态矩。势非零的严格不等式明确采用“非几乎处处为零”；非紧支势另说明截断散射长度。多体局域化、软配对和完整上下界证明仍按文献引用。

正文前置关系与导航关系分别登记。精确术语扫描留下的十项“特征值”候选，已人工检查为通过谱定理或 Laplace 谱定义得到的依赖；理由保存在集成记录中。香蕉空间的相关查询未取得可核实条目，因此保留现有术语，不声称完成全站术语对齐。

## 验证

运行以下检查。

```sh
node scripts/check-bourbaki-notes.mjs
node scripts/check-site-notes.mjs --source-only
node scripts/check-note-prerequisites.mjs
node scripts/check-note-editorial.mjs --strict-format
node scripts/check-subject-navigation.mjs
node scripts/check-topic-narratives.mjs
node scripts/check-number-theory-notes.mjs
node scripts/check-geometry-notes.mjs
node scripts/check-icm-section-coverage.mjs
node tests/bourbaki-math.test.mjs
node scripts/build-site.mjs
```

全站源文件检查通过，3,874 页均可从主页到达，无断链、重复标题或前置循环。公式检查覆盖 43,533 个公式和 46 个图形资源。独立计算测试检查三角格、谱指数、剪切换位子、环带整直、球形势垒、Bogoliubov 系数、LHY 归一化和相干态矩。

构建中的半开区间解析问题已修正。3,874 个静态 HTML 页面已生成，590,986 个站内链接、3,892 个锚点和 27,737 个资源引用通过检查。浏览器禁用 XSLT 后，对 31 个专题样本执行了 62 次桌面和手机视口检查，无横向溢出；搜索、目录、折叠、320 像素窄屏、旧 XML 地址、旧 `/math-blog/` 地址及禁用 JavaScript 时的正文访问也通过回归检查。人工查看了四个专题的桌面或手机截图，保持现有视觉风格。

最终结果另存于 `research/bourbaki-2026-06-validation.json`。结构和数值测试不能代替全部数学证明。此次只整合和本地构建，不提交或推送远程仓库。
