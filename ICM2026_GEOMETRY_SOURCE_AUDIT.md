# ICM2026 代数与复几何整理记录

日期为 2026-09-28。此记录用于后续接续工作，公开页面只包含数学内容和必要的文献署名。

## 覆盖范围

官方报告人页面中，第 4 板块的主列及交叉列共 18 位报告人，合并联合报告后为 15 个专题。原始名单、页面 SHA-256 与提取脚本分别位于 `research/icm2026-geometry-roster.json` 和 `scripts/extract-icm-geometry-roster.mjs`。作者分组、已找到的论文集 DOI、阅读范围和未整理部分记录在 `research/icm2026-geometry.json`。

本轮新增两个专题的选定分支，不代表已完成整个板块。

- `0B00` 超曲面的有理性，依据 Stefan Schreieder 的综述。展开函数域、有理映射、四种有理性、二次超曲面参数化、扩域点判据及抽象双有理障碍。
- `0B20` Cremona 群的代数子群，依据 Susanna Zimmermann 的综述。展开有理自映射群、代数群作用、共轭与正则化、显式二维例子及极大扩张问题。
- `01C0` 与 `01E0` 分别复用 Braden–Proudfoot 和 Stavrova 在代数板块已有的专题。其实际覆盖仍以原 `research/icm2026-algebra.json` 为准。
- 其余 11 个专题未建立公开占位页；Auroux 的确切讲稿尚未找到，Xie 的论文集题名与 DOI 已确认，但全文访问失败。

Schreieder 的第 1 节和第 2 节前半部分已阅读，后续退化、代数闭链、拟阵和三次超曲面证明尚未完整阅读。Zimmermann 的正文第 1 至 4 节已阅读，但参考文献中的证明、分类表的所有分支及高维反例构造尚未展开。

## 数学组织

优先复用已有的环、域、素谱、局部化、层、概形、纤维积、光滑态射及群概形页面。新定义逐页引入符号；泛点与剩余域、代数无关与纯超越扩张分别建页。专题导航列举阅读顺序，前置关系另存 `research/site-polish-geometry.json`，不把导航与交叉应用当作数学前提。

站内证明包括有限生成元清除分母、投影逆公式、无限域上的常值截面、泛点提升、零对象障碍、分式线性变换共轭、二次 Cremona 对合，以及射影直线映射次数乘法。非收缩有理性界、一般正则化及极大扩张的分类结论只给出带出处的陈述；未以例子代替其一般证明。

新交换图使用 Forester 的 `figure`、`tex` 与 `tikz-cd`，构建成 SVG，同时保留文字复合等式。论文集两篇文章的 CC BY 4.0 署名与中文改编说明保存在文献页。

## 核对事项

- 收缩有理性中的两个有理映射必须可复合。任意有理映射不构成以通常复合为运算的范畴。
- 稳定有理性到收缩有理性的站内证明限定无限底域，避免常值截面选择的漏洞。
- 作用的参数族要求开集向群满射，不能用抽象群单射替代。
- 在复数域的光滑连通情形叙述忠实作用，未照搬正特征下的概形核简化。
- 三角子群严格递增不意味着其中某个子群不存在极大扩张。未采用 Zimmermann 例 3.4 中可疑的 Hirzebruch 曲面次数不等式。
- 香蕉空间的有理映射、代数簇页面访问失败，术语逐项比对仍待完成。

## 更新与检查

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

本轮验收结果见 `research/icm2026-geometry-validation.json`。全站 2723 页可达，25657 个公式通过 KaTeX 检查，40 个图像资源存在。53 个新页面通过 XSL 转换；两幅新交换图已栅格化查看。内置浏览器对 XML 页面返回 `ERR_BLOCKED_BY_CLIENT`，因此未记录浏览器实景或移动端检查通过。本地端口 8083 的专题导航返回 HTTP 200。本轮未提交或推送 GitHub。
