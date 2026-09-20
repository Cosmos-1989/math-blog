# ICM 2026 逻辑报告：来源、拆分与覆盖审计

核对日期：2026-09-20。此文件供维护者使用；网站正文按数学主题组织，不以会议分组作为学科名称。

## 范围与版本

以[大会官方报告人目录](https://www.icm2026.org/event/ac193975-5d24-4628-8c30-ddb23de19a8b/speakers)的 `1 - Logic` 标记为范围，交叉分组的报告也纳入，联合报告只计算一次。共 10 位报告人、8 篇报告论文。不是把全部大会报告或其他届大会的同名综述算入本次范围。

采用 SIAM 的正式公开全文，而非仅根据摘要写作。共同出处为 *Proceedings of the International Congress of Mathematicians 2026, Volume 3: Invited Lectures (Sections 1–4)*，Susan Friedlander、Yuri Tschinkel 编，在线 ISBN 9781611978650，2026-07-13 发表。第三卷 3–129 页的逻辑部分对应下列八篇文章。Tent 的对应 arXiv 版本另行链接；未用相似标题的 ECM 2024 文章替代 ICM 2026 稿件。

| 报告作者 | 正式论文 | 页码 | 博客入口 / 来源页 |
| --- | --- | --- | --- |
| David Asperó、Ralf Schindler | [Forcing Axioms and the Continuum Problem: Hilbert’s First Problem Revisited](https://epubs.siam.org/doi/10.1137/25M180295X) | 3–13 | 0077 / 007F |
| Itaï Ben Yaacov | [A Few Features of Continuous and Metric Logic](https://epubs.siam.org/doi/10.1137/25M1806363) | 14–26 | 0078 / 007G |
| Anton Bernshteyn | [Complexity of Local Problems](https://epubs.siam.org/doi/10.1137/25M1807563) | 27–40 | 0079 / 007H |
| Raf Cluckers | [From Cell Decomposition to Motivic Integration, Hensel Minimality, and Point Counting](https://epubs.siam.org/doi/10.1137/25M180545X) | 41–56 | 007A / 007I |
| Marlies Gerber、Philipp Kunde | [Anticlassification Results in Ergodic Theory](https://epubs.siam.org/doi/10.1137/25M1806004) | 57–75 | 007B / 007J |
| Rachel Greenfeld | [Translational Tilings: Structured or Wild?](https://epubs.siam.org/doi/10.1137/25M1801694) | 76–96 | 007C / 007K |
| Will Johnson | [Henselianity and NIP fields](https://epubs.siam.org/doi/10.1137/25M1805412) | 97–112 | 007D / 007L |
| Katrin Tent | [From the Cherlin–Zilber Conjecture via Sharply 2-transitive Groups to the Burnside Problem](https://epubs.siam.org/doi/10.1137/25M1805266) | 113–129 | 007E / 007M |

Tent 预印本：[arXiv:2606.18207](https://arxiv.org/abs/2606.18207)。

八个正式出版页面均标注 © 2026 International Mathematical Union，由 SIAM 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。来源页保留作者、标题、DOI、许可证和改写说明。本站内容是中文改写、知识拆分和补充说明，并非原作者认可的逐字译本；没有复制原文图片或整篇 PDF。

## 覆盖层级

初次导入新增 149 个页面：89 个专题页、42 个共享基础页、10 个导航页、8 个文献页。此前把 89 个专题页统称为“原子笔记”并不准确：来源覆盖及构建通过没有证明语义原子性。用户指出的 00AU 就混合了建筑定义、厚度、旗例子和群论对应，且遗漏了陪集等前置链接。

较早的局部修订新增 79 个独立节点，将 00AU、00AT、008E、007N、007O、007P、007Q、008J 及原有 003D 保留为导航。本轮继续完成全站原有 377 页的审阅，新增 667 个原子条目，其中 395 个属于研究基础与专题；现逻辑来源清单共跟踪 623 页。正文中的概念引用直接改指新节点，例如群作用 00BI、陪集 00BC、Coxeter 抛物子群 00BT、建筑定义 00BY、模型定义 00I8，而非综合页。旧概念仍复用，如群 0001、内部群 003J、可分性 0025。

实际完成范围和逐页决定见 [EVERGREEN_REFACTOR_AUDIT.md](EVERGREEN_REFACTOR_AUDIT.md)、`research/site-review-*.json` 和 `research/site-evergreen-audit.json`。原页面均有审阅记录，无 pending；这表示完成一轮编辑核对，不表示自动证明全部数学陈述及证明无误。

覆盖的是八篇报告的主要定义、核心结论、适用假设、证明路线和明确开放问题。报告中的完整参考书目、历史轶事及每一项旁支结果没有逐条复制。必要前置知识以理解这些陈述和证明路线为目标，默认读者具备初等集合、线性代数和基本分析语言。

**这不是“所有技术证明及其无限递归前置知识均已补齐”的声明。** 以下深层技术仍仅有说明或路线，需沿文献继续阅读，不能把路线页当作完整证明：

- Pmax 条件的完整迭代理想定义、可迭代性验证及 MM++ 蕴含星公理的长证明。
- 连续逻辑的完整语法编码、强类型遗漏构造与仿射逻辑积分分解技术。
- Borel / LOCAL 对应中完整的算法模拟和复杂度分离构造。
- 一般 Hensel 极小准备与动机积分的全套范畴和测度构造。
- Feldman 模式、圆周系统与 Anosov–Katok 光滑实现的全部定量估计。
- 非周期铺砌编码的全部有限约束表及不可判定性的完整模拟。
- dp 有限域 Hensel 性的全套模型论论证、微分赋值结构及分类证明。
- 有限秩群识别、非分裂尖锐传递构造及 Burnside 正规形式的完整归纳证明。

这些边界也在相应正文中以“证明路线”“目标”“附加假设”等表述区别于已证明定理。后续扩充应在现有 ID 上深化或增加显式前置节点，不重建重复主题。

## 逐专题映射

### 强迫公理与连续统（0077）

来源：[David Asperó、Ralf Schindler](https://epubs.siam.org/doi/10.1137/25M180295X)。正文各页的 `source` 元数据保留章节或定理编号。

- [008T 力迫公理与 Martin 公理](trees/math/logic/research/008T.tree)
- [008U Martin 最大公理及其加强 MM++](trees/math/logic/research/008U.tree)
- [008V Pmax 与 Woodin 的星公理](trees/math/logic/research/008V.tree)
- [008W MM++ 蕴含星公理](trees/math/logic/research/008W.tree)
- [008X 决定性给出的 Turing 锥二择一](trees/math/logic/research/008X.tree)
- [008Y 大基数与泛型绝对性](trees/math/logic/research/008Y.tree)
- [008Z 更高遗传层级的最大性问题](trees/math/logic/research/008Z.tree)

### 连续逻辑与度量结构（0078）

来源：[Itaï Ben Yaacov](https://epubs.siam.org/doi/10.1137/25M1806363)。正文各页的 `source` 元数据保留章节或定理编号。

- [0090 连续逻辑的实值公式](trees/math/logic/research/0090.tree)
- [0091 可定义谓词的一致极限构造](trees/math/logic/research/0091.tree)
- [0092 度量语言与完备度量结构](trees/math/logic/research/0092.tree)
- [0093 度量超积与连续 Łoś 定理](trees/math/logic/research/0093.tree)
- [0094 紧集空间的 Vietoris 拓扑](trees/math/logic/research/0094.tree)
- [0095 紧值逻辑与基本量词](trees/math/logic/research/0095.tree)
- [0096 概率代数及其连续逻辑理论](trees/math/logic/research/0096.tree)
- [0097 类型空间的逻辑拓扑与类型距离](trees/math/logic/research/0097.tree)
- [0098 度量逻辑的类型遗漏](trees/math/logic/research/0098.tree)
- [0099 度量 Ryll–Nardzewski 定理](trees/math/logic/research/0099.tree)
- [009A 仿射逻辑与模型的积分分解](trees/math/logic/research/009A.tree)

### 局部问题的组合与算法复杂度（0079）

来源：[Anton Bernshteyn](https://epubs.siam.org/doi/10.1137/25M1807563)。正文各页的 `source` 元数据保留章节或定理编号。

- [009B 局部可检验标记问题](trees/math/logic/research/009B.tree)
- [009C 局部问题的五种正则性类别](trees/math/logic/research/009C.tree)
- [009D 自由移位对局部标记的普适性](trees/math/logic/research/009D.tree)
- [009E 分布式 LOCAL 模型与运行半径](trees/math/logic/research/009E.tree)
- [009F 连续可解性与次对数局部算法](trees/math/logic/research/009F.tree)
- [009G 局部复杂性如何依赖群的几何](trees/math/logic/research/009G.tree)
- [009H 独立同分布因子与等变标记](trees/math/logic/research/009H.tree)
- [009I 有限编码因子与编码半径](trees/math/logic/research/009I.tree)
- [009J 局部复杂性的未解决比较](trees/math/logic/research/009J.tree)

### 驯服几何、积分与有理点（007A）

来源：[Raf Cluckers](https://epubs.siam.org/doi/10.1137/25M180545X)。正文各页的 `source` 元数据保留章节或定理编号。

- [009K 一元胞腔分解与函数准备](trees/math/logic/research/009K.tree)
- [009L p 进指数和的衰减与有理性边界](trees/math/logic/research/009L.tree)
- [009M 首项结构与 1-Hensel 极小性](trees/math/logic/research/009M.tree)
- [009N Hensel 极小几何的 Taylor 准备目标](trees/math/logic/research/009N.tree)
- [009O 构造函数的参数积分闭包](trees/math/logic/research/009O.tree)
- [009P 动机积分与统一局部域公式](trees/math/logic/research/009P.tree)
- [009Q 积分恒等式的转移原理](trees/math/logic/research/009Q.tree)
- [009R Pila–Wilkie 有理点计数](trees/math/logic/research/009R.tree)
- [009S 超曲面的维数增长界](trees/math/logic/research/009S.tree)
- [009T 温和赋值几何与计数的开放方向](trees/math/logic/research/009T.tree)

### 遍历系统的分类复杂度（007B）

来源：[Marlies Gerber、Philipp Kunde](https://epubs.siam.org/doi/10.1137/25M1806004)。正文各页的 `source` 元数据保留章节或定理编号。

- [009U 遍历系统的分类层次](trees/math/logic/research/009U.tree)
- [009V 无穷分支树与完全解析性归约](trees/math/logic/research/009V.tree)
- [009W Kakutani 等价是完全解析关系](trees/math/logic/research/009W.tree)
- [009X Feldman 模式与删除距离](trees/math/logic/research/009X.tree)
- [009Y Anosov–Katok 共轭逼近法](trees/math/logic/research/009Y.tree)
- [009Z 圆周符号系统与 Foreman–Weiss 函子](trees/math/logic/research/009Z.tree)
- [00A0 光滑遍历系统的非 Borel 分类](trees/math/logic/research/00A0.tree)
- [00A1 无限测度系统的完全解析同构关系](trees/math/logic/research/00A1.tree)
- [00A2 零熵混合系统仍不可 Borel 分类](trees/math/logic/research/00A2.tree)
- [00A3 K 微分同胚的完全解析分类障碍](trees/math/logic/research/00A3.tree)
- [00A4 反分类结果留下的动力系统问题](trees/math/logic/research/00A4.tree)

### 平移铺砌的结构与非周期性（007C）

来源：[Rachel Greenfeld](https://epubs.siam.org/doi/10.1137/25M1801694)。正文各页的 `source` 元数据保留章节或定理编号。

- [00A5 阿贝尔群上的单块平移铺砌](trees/math/logic/research/00A5.tree)
- [00A6 铺砌的周期、弱周期与非周期方程](trees/math/logic/research/00A6.tree)
- [00A7 单块铺砌的膨胀不变性](trees/math/logic/research/00A7.tree)
- [00A8 平移铺砌的可逆结构定理](trees/math/logic/research/00A8.tree)
- [00A9 一维与二维单块铺砌的周期性](trees/math/logic/research/00A9.tree)
- [00AA 软铺砌与多重覆盖](trees/math/logic/research/00AA.tree)
- [00AB 方向着色与铺砌编码](trees/math/logic/research/00AB.tree)
- [00AC p 进数独与非周期单块的构造](trees/math/logic/research/00AC.tree)
- [00AD 平移单块铺砌的不可判定性](trees/math/logic/research/00AD.tree)
- [00AE 欧氏空间中的可测平移铺砌](trees/math/logic/research/00AE.tree)
- [00AF 低维周期性与固定维数判定问题](trees/math/logic/research/00AF.tree)

### NIP 域、赋值与整环（007D）

来源：[Will Johnson](https://epubs.siam.org/doi/10.1137/25M1805412)。正文各页的 `source` 元数据保留章节或定理编号。

- [00AG Ax–Kochen–Ershov 原理与大素数转移](trees/math/logic/research/00AG.tree)
- [00AH NIP 域与 Shelah 猜想](trees/math/logic/research/00AH.tree)
- [00AI NIP 赋值域中已证明的 Hensel 性](trees/math/logic/research/00AI.tree)
- [00AJ NIP 交换环的局部性约束](trees/math/logic/research/00AJ.tree)
- [00AK 理想格的宽度](trees/math/logic/research/00AK.tree)
- [00AL 可定义域拓扑与典范拓扑](trees/math/logic/research/00AL.tree)
- [00AM 由导子构造的 NIP 非赋值环](trees/math/logic/research/00AM.tree)
- [00AN 赋值扩张的缺陷与赋值复合](trees/math/logic/research/00AN.tree)
- [00AO Anscombe–Jahnke 的 NIP 赋值条件](trees/math/logic/research/00AO.tree)
- [00AP dp 有限域的赋值分类](trees/math/logic/research/00AP.tree)
- [00AQ 有序阿贝尔群的 NIP 与 dp 秩判据](trees/math/logic/research/00AQ.tree)
- [00AR dp 极小整环的剩余环拉回分类](trees/math/logic/research/00AR.tree)
- [00AS NIP 域与环的开放问题](trees/math/logic/research/00AS.tree)

### 模型论群、尖锐传递与 Burnside 问题（007E）

来源：[Katrin Tent](https://epubs.siam.org/doi/10.1137/25M1805266)。正文各页的 `source` 元数据保留章节或定理编号。

- [00AT BN 对与 Bruhat 分解](trees/math/logic/research/00AT.tree)
- [00AU 建筑与旗的几何](trees/math/logic/research/00AU.tree)
- [00AV 广义多边形与秩二建筑](trees/math/logic/research/00AV.tree)
- [00AW Cherlin–Zilber 猜想与代数群识别](trees/math/logic/research/00AW.tree)
- [00AX 尖锐多重传递作用](trees/math/logic/research/00AX.tree)
- [00AY 近域与分裂尖锐二传递群](trees/math/logic/research/00AY.tree)
- [00AZ 尖锐二传递群的分裂判据](trees/math/logic/research/00AZ.tree)
- [00B0 尖锐二传递群的置换特征](trees/math/logic/research/00B0.tree)
- [00B1 非分裂尖锐传递群的存在](trees/math/logic/research/00B1.tree)
- [00B2 有限 Morley 秩下的尖锐二传递群](trees/math/logic/research/00B2.tree)
- [00B3 对合上的拟双曲反射几何](trees/math/logic/research/00B3.tree)
- [00B4 HNN 扩张与 Britton 引理](trees/math/logic/research/00B4.tree)
- [00B5 双曲群与 Dehn 算法](trees/math/logic/research/00B5.tree)
- [00B6 小消去关系与分级商群](trees/math/logic/research/00B6.tree)
- [00B7 有界指数 Burnside 问题](trees/math/logic/research/00B7.tree)
- [00B8 正特征中的非分裂尖锐二传递群](trees/math/logic/research/00B8.tree)
- [00B9 模型论群与反射几何的开放问题](trees/math/logic/research/00B9.tree)

## 共享基础

### 模型论的共同语言

- [007N 一阶语言、结构与可定义集合](trees/math/logic/research/007N.tree)
- [007O 初等等价与初等嵌入](trees/math/logic/research/007O.tree)
- [007P 类型、饱和模型与类型空间](trees/math/logic/research/007P.tree)
- [007Q 超滤子、超积与 Łoś 定理](trees/math/logic/research/007Q.tree)
- [007R 一阶逻辑的紧致性定理](trees/math/logic/research/007R.tree)
- [007S Löwenheim–Skolem 定理与可分模型](trees/math/logic/research/007S.tree)
- [008N VC 维数与无独立性质 NIP](trees/math/logic/research/008N.tree)
- [008O dp 秩、dp 极小与有限依赖维数](trees/math/logic/research/008O.tree)
- [008P 稳定性、序性质与 ω 稳定性](trees/math/logic/research/008P.tree)
- [008Q 可定义群与解释](trees/math/logic/research/008Q.tree)
- [008R Morley 秩与有限秩群](trees/math/logic/research/008R.tree)

### 集合论与可计算性

- [007Y 序数、基数与幂集](trees/math/logic/research/007Y.tree)
- [007Z ZFC、公理模型与相对一致性](trees/math/logic/research/007Z.tree)
- [0080 连续统假设及其独立性](trees/math/logic/research/0080.tree)
- [0081 内模型、可构造宇宙与相对可构造性](trees/math/logic/research/0081.tree)
- [0082 力迫偏序、稠密集与滤子](trees/math/logic/research/0082.tree)
- [0083 可数模型的泛型滤子与 Cohen 实数](trees/math/logic/research/0083.tree)
- [0084 闭无界集、平稳集与遗传小集合](trees/math/logic/research/0084.tree)
- [0085 大基数与初等嵌入的强度](trees/math/logic/research/0085.tree)
- [0086 无限博弈与决定性公理](trees/math/logic/research/0086.tree)
- [0087 Turing 可归约性与 Turing 度](trees/math/logic/research/0087.tree)
- [007X 可判定性、半判定与计算归约](trees/math/logic/research/007X.tree)

### 描述集合论与拓扑

- [007T Polish 空间与标准 Borel 空间](trees/math/logic/research/007T.tree)
- [007U Borel 可测性、Baire 可测性与零集](trees/math/logic/research/007U.tree)
- [007V 解析集与完全解析集](trees/math/logic/research/007V.tree)
- [007W Borel 归约与分类问题](trees/math/logic/research/007W.tree)
- [008S 极端点、Choquet 单纯形与 Bauer 单纯形](trees/math/logic/research/008S.tree)

### 概率与动力系统

- [0088 概率空间、积分与几乎处处](trees/math/logic/research/0088.tree)
- [0089 保测变换、共轭与保测流](trees/math/logic/research/0089.tree)
- [008A 遍历、弱混合与混合](trees/math/logic/research/008A.tree)
- [008B Kolmogorov–Sinai 熵与 K 性质](trees/math/logic/research/008B.tree)
- [008C 诱导变换、悬挂流与 Kakutani 等价](trees/math/logic/research/008C.tree)
- [008D 移位作用、柱集与子移位](trees/math/logic/research/008D.tree)
- [008E 群作用、Cayley 图与自由群](trees/math/logic/research/008E.tree)

### 域与可定义几何

- [008J 理想、局部环与 Krull 维数](trees/math/logic/research/008J.tree)
- [008F 赋值、赋值环、值群与剩余域](trees/math/logic/research/008F.tree)
- [008G Hensel 性与单根提升](trees/math/logic/research/008G.tree)
- [008H p 进数与形式 Laurent 级数](trees/math/logic/research/008H.tree)
- [008I 代数闭域、实闭域与可分闭域](trees/math/logic/research/008I.tree)
- [008K o 极小结构与可定义维数](trees/math/logic/research/008K.tree)
- [008L 半代数集合与量词消去](trees/math/logic/research/008L.tree)
- [008M Haar 测度与非阿基米德积分](trees/math/logic/research/008M.tree)

## 勘误与约定

- 严格区分已证明定理、相对一致性、条件性结果与开放问题；不把 CH 独立性写成 ZFC 证明 CH 为假。
- Cluckers 的高维 Taylor 准备是目标陈述，不作为无条件定理；Igusa 型统一指数和界保留猜想身份。
- Cluckers 定理 1.4 的普遍有理性表述按字面有常数多项式 f=1 的反例；009L 给出反例及线性递推证明，不把该未加限制的表述作为正确定理收入。局部 zeta 的有理性与此处指数和级数的有理性不可混淆。
- 保测弱混合的 Cesaro 公式使用随求和变化的迭代指标，并写明极限为零。
- p 进闭域的定义包含 Hensel 性，不能仅列剩余域和值群条件。
- Möbius 变换的行列式条件为 ad-bc 非零；BN 对例子的 N 是单项矩阵群，不仅是置换矩阵群。
- BN 对公理采用包含式及非退化条件；代数群识别不无条件扩张到所有带 BN 对的抽象群。
- 右近域对应 x 映到 xa+b；不可把右分配律与左仿射写法混用。
- 特征二时 Neumann 分裂判据必须另作表述；四元域的仿射群直接表明 tJ 未必是子群。正文给出这个检验。
- HNN 扩张关系为 t 的逆乘 i 乘 t 等于 j，不是同时共轭 i、j 的错误等式。
- 无限有限秩近域、无限尖锐三传递群的识别声明保留无限性，不误含有限反例。
- dp 极小整环的拉回构造区分无限域情形与有限退化情形。

## 组织与技术

- 主入口为 `0075`，基础工具为 `0076`；首页与逻辑目录 `0061` 已接入。
- 代数、数论、动力系统、概率、组合学、计算机科学、统计目录共享链接，不复制正文。
- 不增加手写“相关页面”；依赖由正文链接与生成的反向链接表达。
- 四幅研究图现位于 `00RT`、`00VE`、`00XG`、`00AR`，使用 Sterling 式 `figure/tex/tikz-cd` 生成 SVG；其中包含关系图和编码路线图不伪称交换方块。拆分前的 0089、009G、00AC 保留为导读。
- Forester 将连续双中括号识别为链接，形式幂级数改用 LaTeX 方括号命令；TeX 控制序列与除号之间留空格以避免被解析为带路径的命令。
- 本次工作不修改原有主题子模块，不处理其他未跟踪项目，也不执行 Git 提交或推送。

## 可重复验证

```sh
forester build forest.toml
node scripts/check-logic-notes.mjs
node scripts/check-logic-notes.mjs --katex /path/to/katex/dist/katex.js
python3 -m http.server 8083 --bind 127.0.0.1 --directory output
```

机器可读的来源与页面清单见 [research/icm2026-logic.json](research/icm2026-logic.json)。校验器检查唯一 ID、内部链接、总入口可达性、来源、生成 XML 与 SVG；可选 KaTeX 检查验证每个生成公式。它不宣称能自动验证数学证明。

本地阅读入口：[现代逻辑的研究路径](http://localhost:8083/math-blog/0075/)。

初次导入验证记录：Forester 完整构建成功；当时 149 个页面均可从总入口到达；生成公式通过 KaTeX 检查；四幅 SVG 已逐幅栅格化查看，文字与箭头没有裁切。该记录是技术检查，不是语义原子性检查。

本轮全站修订验证记录：Forester 完整构建成功；来源清单内 623 页可达，3558 个公式片段通过 KaTeX，四幅研究 SVG 资源完整。全站 1044 页可达且登记审阅，6693 个公式片段与 8 幅图资源通过检查；823 个节点的 2142 条必要前置边无环，且均有正文链接、非目录目标。本地 HTTP 入口返回 200；曾在内置浏览器读取到力迫公理页的前置链接与中文页脚，但之后的新页面导航受到客户端拦截，未将静态检查冒充全站逐页视觉验收。
