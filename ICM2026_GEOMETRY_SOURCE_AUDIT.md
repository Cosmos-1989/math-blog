# ICM2026 代数与复几何整理记录

首批日期为 2026-09-28，最近补充于 2026-10-12。此记录用于后续接续工作，公开页面只包含数学内容和必要的文献署名。

## 覆盖范围

官方报告人页面中，第 4 板块的主列及交叉列共 18 位报告人，合并联合报告后为 15 个专题。原始名单、页面 SHA-256 与提取脚本分别位于 `research/icm2026-geometry-roster.json` 和 `scripts/extract-icm-geometry-roster.mjs`。作者分组、已找到的论文集 DOI、阅读范围和未整理部分记录在 `research/icm2026-geometry.json`。

目前已新增九个专题的选定分支，另复用两个代数专题，不代表已完成整个板块。

- `0B00` 超曲面的有理性，依据 Stefan Schreieder 的综述。展开函数域、有理映射、四种有理性、二次超曲面参数化、扩域点判据及抽象双有理障碍。
- `0B20` Cremona 群的代数子群，依据 Susanna Zimmermann 的综述。展开有理自映射群、代数群作用、共轭与正则化、显式二维例子及极大扩张问题。
- `01C0` 与 `01E0` 分别复用 Braden–Proudfoot 和 Stavrova 在代数板块已有的专题。其实际覆盖仍以原 `research/icm2026-algebra.json` 为准。
- `0B40` 模空间的内蕴构造，依据 Alper 与 Halpern-Leistner 的联合报告。包含叠与商、好模空间、曲线丛稳定性、Rees 构造、Θ 完备性、S 完备性和存在判据。
- `0B80` 非阿贝尔 Hodge 理论与线性 Shafarevich 猜想，依据 Bakker 的报告。包含局部系统、对数联络、Higgs 丛、幂零留数对应、Hodge 与 twistor 结构、绝对可构造集、Shafarevich 态射和万有覆盖的 Stein 性。
- `0BF0` Fano 簇的 K 稳定性与赋值判据，依据 Kento Fujita 的报告。
- `0BG0` 阿贝尔簇的 Weil 类与割线层，依据 Eyal Markman 的报告。
- `0BH0` 典范丛数值平凡的全纯叶状结构，依据 Jorge Vitório Pereira 的报告。
- `0BJ0` 几何朗兰兹与 Arthur–Ramanujan 参数，依据 Sam Raskin 的公告及合作预印本中已明确的研究状态。
- `0BL0` 拉格朗日 Floer 理论与镜像几何，依据 Denis Auroux 的报告，同时列于几何导航。
- 其余 4 个专题未建立公开占位页；Xie 的论文集题名与 DOI 已确认，但全文访问失败。

Schreieder 的第 1 节和第 2 节前半部分已阅读，后续退化、代数闭链、拟阵和三次超曲面证明尚未完整阅读。Zimmermann 的正文第 1 至 4 节已阅读，但参考文献中的证明、分类表的所有分支及高维反例构造尚未展开。

Alper–Halpern-Leistner 的 arXiv 版本第 1 至 4 节已阅读，并与发表版第 2、3 节比对。第 4 节包含进行中的工作，未将其中的退化空间构想写成已证定理。第 5、6 节的奇异曲线和双有理模型尚未整理。Bakker 的第 1 至 3 节、第 4 节至变形定理陈述以及第 5 节已阅读；一般抛物对应、混合 twistor D-模、完整变形理论及 Shafarevich 定理的深层证明仍未展开。逐项阅读范围见 `research/geometry-moduli-hodge.json`。

## 数学组织

优先复用已有的环、域、素谱、局部化、层、概形、纤维积、光滑态射及群概形页面。新定义逐页引入符号；泛点与剩余域、代数无关与纯超越扩张分别建页。专题导航列举阅读顺序，前置关系另存 `research/site-polish-geometry.json`，不把导航与交叉应用当作数学前提。

站内证明包括有限生成元清除分母、投影逆公式、无限域上的常值截面、泛点提升、零对象障碍、分式线性变换共轭、二次 Cremona 对合，以及射影直线映射次数乘法。非收缩有理性界、一般正则化及极大扩张的分类结论只给出带出处的陈述；未以例子代替其一般证明。

新交换图使用 Forester 的 `figure`、`tex` 与 `tikz-cd`，构建成 SVG，同时保留文字复合等式。论文集四篇文章的 CC BY 4.0 署名与中文改编说明保存在各文献页。

后续两个专题新增 95 页，其中 2 页为导航、2 页为文献、91 页为知识节点。一般局部系统复用到旧圆周页面，除子页面补入主除子度为零的证明链接。新写的初等证明包括不变量商的泛性质、平均算子、权分解、Rees 纤维、加权斜率计算、矩阵一阶变形、幂零指数与对数、Hartogs 延拓，以及所用的 Cauchy 公式和 Stokes 公式。研究定理的完整证明未由这些计算替代。

## 核对事项

- 收缩有理性中的两个有理映射必须可复合。任意有理映射不构成以通常复合为运算的范畴。
- 稳定有理性到收缩有理性的站内证明限定无限底域，避免常值截面选择的漏洞。
- 作用的参数族要求开集向群满射，不能用抽象群单射替代。
- 在复数域的光滑连通情形叙述忠实作用，未照搬正特征下的概形核简化。
- 三角子群严格递增不意味着其中某个子群不存在极大扩张。未采用 Zimmermann 例 3.4 中可疑的 Hirzebruch 曲面次数不等式。
- 香蕉空间的有理映射、代数簇页面访问失败，术语逐项比对仍待完成。
- 对数非阿贝尔 Hodge 对应保留半单性、多稳定性、有理 Chern 类消失和幂零留数条件；模空间之间陈述欧氏拓扑同胚。
- 非固有线性 Shafarevich 定理给出全纯凸复空间的稠密解析 Zariski 开子空间，不能删去“开子空间”而断言万有覆盖自身全纯凸。
- Shafarevich 存在定理保留局部系统族的秩有界条件；Stein 判据另要求大性和不可延拓性。
- 代数叠、局部系统的香蕉空间页面同样访问失败，未记为术语比对通过。

## 更新与检查

2026-10-12 的三个专题新增 61 页，其中 3 页为综述、3 页为文献、55 页为知识节点。阅读范围、前置关系、未展开分支和文献许可登记在 `research/geometry-fujita-markman-pereira.json`。依据 SIAM 开放获取的正式论文集正文，文献页保留 CC BY 4.0 署名与改编说明。此次只整理记录中列出的段落及结论，未登记为三篇全文逐段读完。

Fujita 专题区分 K 半稳定、K 多稳定、K 稳定与一致 K 稳定，保留稳定性阈值的维数界。Markman 专题限定虚二次域情形，分别陈述四维一般 Weil 型和六维分裂 Weil 型的代数性；Orlov 变换后经有限群下降取得半正则层的步骤没有省略。Pereira 专题为定理 6.1 补回上下文使用的典范丛数值平凡假设，并区分局部自由切层与处处正则的叶状结构。数值平坦性页面取射影情形，未把曲线次数定义直接用于一般紧 Kähler 流形。

新增证明包括 Weil 类的 Hodge 类型、归一化 Chern 特征的张量不变性、纯旋量的消灭子计算和射影空间叶状结构的典范丛公式。射影直线的稳定性阈值计算及环面上同调计算仍调用已标明的外部结果。深层研究定理保留出处，未用这些计算替代一般证明。香蕉空间检索未取得可用于逐项核对的新结果，不能记为术语核对通过。

```sh
node scripts/sync-geometry-notes.mjs
node scripts/check-geometry-notes.mjs
node scripts/check-site-notes.mjs --source-only
node scripts/check-note-editorial.mjs --strict-format
node scripts/check-subject-navigation.mjs
node scripts/apply-theme.mjs
forester build forest.toml
```

`sync-geometry-notes.mjs` 只合并本轮明确记录的页面，不重放其他专题的历史审查记录。全站结构检查与公式测试不等同于数学证明审查。数值样例用精确整数检验参数化抄录，不能代替正文证明。

首批验收结果见 `research/icm2026-geometry-validation.json`。当时全站 2723 页可达，25657 个公式通过 KaTeX 检查，40 个图像资源存在。53 个新页面通过 XSL 转换；两幅新交换图已栅格化查看。内置浏览器对 XML 页面返回 `ERR_BLOCKED_BY_CLIENT`，因此未记录浏览器实景或移动端检查通过。

两个后续专题的检查另存 `research/icm2026-moduli-hodge-validation.json`。本次没有提交或推送 GitHub。

2026-10-12 的检查另存 `research/icm2026-fujita-markman-pereira-validation.json`。Forester 构建成功；全站 2983 页可达，28772 个公式通过 KaTeX 0.16.11 检查，43 个图像资源存在。61 个新页面及学科目录均通过 XSL 转换，前置关系无环且无断链，格式检查通过。本地 8083 端口返回新页面的 HTTP 200。内置浏览器仍对 XML 返回 `ERR_BLOCKED_BY_CLIENT`，未完成浏览器视觉检查。这一批也尚未提交或推送。

## Raskin 与 Auroux

2026-10-12 后续增加 67 页，其中 2 页为研究综述、2 页为文献、63 页为知识节点。范围与逐页前置关系见 `research/geometry-raskin-auroux.json`。Raskin 的正文按实际阅读段落登记，Auroux 的作者版正文第 1 至 3 节已阅读，参考文献及其深层证明未逐篇展开。

Raskin 专题由闭点、主丛、Hecke 改造及常数项进入 Satake、Weil 群与 Arthur 参数，再解释 Whittaker 判据、范畴迹和谱滤过。有限阶中心特征标、闭点基数、一般群的特征限制及半典范丛假设均单独说明。作者的公告与合作论文已证明的零轨道比较分别标记，未将合作论文列出的猜想写成定理。投射模中特征子模产生开闭分支的代数证明已补全。

Auroux 专题由辛形式、余切丛、拉格朗日图像、伪全纯能量及Morse复形进入Floer理论，再讨论弯曲高阶运算、生成元、余切丛、SYZ镜像与扇区拼合。微分平方为零的论证明确依赖模空间紧化与粘合；余切生成和下降定理保留文献归属。三幅新图使用Sterling形式，分别为Arthur参数三角图、扇区同伦推出和曲面限制同伦拉回。

本批次没有完成Floer分析基础、微局部层理论及几何朗兰兹完整证明；相应范围留在整理记录中，公开词条保留准确的定理来源。术语检索未能完成香蕉空间逐项比对。本批次未提交或推送GitHub。

检查结果见 `research/icm2026-raskin-auroux-validation.json`。全站3050页可达，29582个公式通过KaTeX检查，46个图像资源存在。67个新页面及两个目录通过XSL转换。三幅图的同源TeX已独立编译成路径SVG并查看，Auroux两幅图也与原PDF第14、15页比对。内置浏览器仍返回`ERR_BLOCKED_BY_CLIENT`，未完成实际浏览器视口检查。
