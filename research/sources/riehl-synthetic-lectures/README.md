# 从同伦类型到合成高阶范畴
## 空间、路径归纳、Yoneda 引理与有向单价性

中文数学讲义，基于 Emily Riehl 的 ICM 2026 报告
“Synthetic Perspectives on Spaces and Categories”及正文所列原始文献编写。

交付 PDF 为 153 页，包含 22 章、2 篇附录及参考文献。
正文使用“定义—例—引理—命题—定理—证明—注记”体例。

## 编译

需要包含 ctex、fontspec、amsmath、amsthm、tikz-cd、hyperref、needspace
等标准宏包的 TeX Live 或 MiKTeX。使用 XeLaTeX，不使用 pdfLaTeX。

在本目录运行：

    latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex

也可以连续运行三次：

    xelatex -interaction=nonstopmode -halt-on-error main.tex

参考文献直接写在 references.tex，不需要 BibTeX/Biber。
主文件自动优先采用系统中的 Noto Serif CJK SC；未安装时采用
TeX 发行版附带的 Fandol 字体。文件包不包含字体文件。
更换字体或 TeX 版本后，分页可能稍有变化。

## Overleaf

上传此目录中的 main.tex、references.tex 和整个 chapters 目录，
将编译器设置为 XeLaTeX，将主文件设置为 main.tex。
也可以只上传同包中的 standalone.tex 并以它作为主文件。
standalone.tex 是按正文顺序合并的单文件版本，与分章版本内容一致。

## 文件结构

- main.tex：导言区、标题、目录及各章的输入顺序。
- chapters/01_sets.tex 至 chapters/22_semantics.tex：22 章正文。
- chapters/a_calculations.tex：圆周、同伦纤维及单形乘积的详细计算。
- chapters/b_glossary.tex：术语、符号和主要结果索引。
- references.tex：19 项参考文献及公开链接。
- standalone.tex：无需其他输入文件的合并版源码。

## 数学内容与证明前提

依赖和、依赖积、同一性类型、函数外延性、命题截断、所用宇宙
和有向形状的规则在正文中逐项说明。内部结论按这些规则推导。
Quillen 模型结构、严格单价宇宙的存在、内部 Segal 条件的形状比较
以及普遍左纤维化的高维比较，作为注明来源的基础定理使用。
第 22 章解释其语义及在正文中的用途。
附录 A 在明确列出的圆周高阶归纳规则下完成编码—解码计算。

本讲义不是 Riehl 原文的翻译；源码包不含第三方图书、论文全文或字体。
