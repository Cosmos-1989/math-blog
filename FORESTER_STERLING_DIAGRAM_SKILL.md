# Forester Sterling-Style Diagram Skill

Use this workflow when adding commutative diagrams to this Forester blog and you want the result to match Jon Sterling's style: Forester compiles a LaTeX/TikZ diagram to an SVG asset during build, then embeds it as a `<figure><img ...svg></figure>` in the generated site.

## When To Use

Use this for:

- Commutative diagrams with multiple arrows, labels, diagonal arrows, or pullback-style corners.
- Diagrams that are too fragile or ugly as KaTeX `array` displays.
- Diagrams that should render as stable SVG images in the static site.

Do not use this for:

- Very simple equations where `##{...}` is enough.
- Inline mathematical notation.
- Temporary drafts where the diagram may change every few minutes.

## Core Forester Pattern

In a `.tree` file, wrap a LaTeX diagram in `\figure{\tex{preamble}{body}}`.

Example:

```forester
\figure{\tex{\usepackage{tikz-cd}}{
\begin{tikzcd}[column sep=large,row sep=large]
G\times G\times G \arrow[r,"m\times \pi_2"] \arrow[d,"\pi_0\times m"'] & G\times G \arrow[d,"m"] \\
G\times G \arrow[r,"m"'] & G
\end{tikzcd}
}}
```

Forester will:

- Compile the LaTeX body using the supplied preamble.
- Convert the result to SVG via the LaTeX-to-SVG build pipeline.
- Emit a `fr:resource` node containing an HTML image.
- Copy the generated SVG into the site output.

The generated XML looks like:

```xml
<html:figure>
  <fr:resource hash="...">
    <fr:resource-content>
      <html:img src="/math-blog/<hash>.svg" />
    </fr:resource-content>
  </fr:resource>
</html:figure>
```

This matches the pattern observed on Jon Sterling's Forester pages, where diagrams appear as:

```html
<figure>
  <img src="/<hash>.svg">
</figure>
```

## Required Dependencies

The local machine must have a working LaTeX toolchain capable of compiling the diagram package, plus `dvisvgm`.

For `tikz-cd` diagrams, the LaTeX preamble usually needs:

```tex
\usepackage{tikz-cd}
```

If `forester build forest.toml` fails while building `build/resources/<hash>.svg`, check whether the LaTeX package is installed.

## Verification

Run:

```sh
forester build forest.toml
```

A successful first build for a new diagram may print a message like:

```text
Building ./build/resources/<hash>.svg
Success!
```

Then inspect the generated page XML:

```sh
rg -n "fr:resource|html:img|tikzcd|<hash>" output/math-blog/<TREE_ID>/index.xml
```

You should see an `html:figure` containing a `fr:resource` and an `html:img`.

Also confirm the SVG exists in the output root:

```sh
find output/math-blog -maxdepth 1 -name '*<hash>*' -print
```

## Important Gotchas

- Do not write `\figure{\img{...}}`. In this local Forester version, `\figure` is built in but `\img` is not a known binding, so this produces an unresolved identifier warning and leaves literal `\img{...}` in the output.
- Do not hand-maintain SVG files unless absolutely necessary. Prefer `\tex{...}{...}` so Forester owns hashing, routing, and output copying.
- Add `build/` to `.gitignore`. Forester uses `build/resources/` as a generated cache for diagram SVGs; these should not be committed.
- Keep a textual equation immediately after important diagrams. This improves accessibility, searchability, and mathematical clarity.
- If a diagram is semantically important, write both the diagram and the equivalent composite equality.

Example:

```forester
\p{这张图的含义是两条从 #{G\times G\times G} 到 #{G} 的复合相等：}

##{m\circ(m\times\pi_2)=m\circ(\pi_0\times m)}
```

## Preferred Diagram Style

Use `tikz-cd` for commutative diagrams:

```forester
\figure{\tex{\usepackage{tikz-cd}}{
\begin{tikzcd}[column sep=large,row sep=large]
A \arrow[r,"f"] \arrow[d,"g"'] & B \arrow[d,"h"] \\
C \arrow[r,"k"'] & D
\end{tikzcd}
}}
```

Tips:

- Use `column sep=large,row sep=large` for readable blog diagrams.
- Use `"label"` for labels above/right of arrows.
- Use `"label"'` for labels below/left of arrows.
- Use `\arrow[r]`, `\arrow[l]`, `\arrow[u]`, `\arrow[d]` for ordinary arrows.
- Use `\arrow[dr]`, `\arrow[dl]`, etc. for diagonal arrows.
- Use `\arrow[r,dashed]` for dashed arrows.
- Use `\arrow[r,hook]`, `\arrow[r,two heads]`, or other `tikz-cd` styles when appropriate.

## Current Working Example

The first successful use in this blog is in:

```text
trees/math/category/003B.tree
```

It renders the associativity diagram for an internal group:

```forester
\figure{\tex{\usepackage{tikz-cd}}{
\begin{tikzcd}[column sep=large,row sep=large]
G\times G\times G \arrow[r,"m\times \pi_2"] \arrow[d,"\pi_0\times m"'] & G\times G \arrow[d,"m"] \\
G\times G \arrow[r,"m"'] & G
\end{tikzcd}
}}
```

The build produced:

```text
build/resources/67b5ea213e109d47f6b141e149792881.svg
output/math-blog/67b5ea213e109d47f6b141e149792881.svg
```

The `build/` file is cache; the `output/` file is generated site output. Neither should be manually edited.

## Suggested Editing Workflow

1. Replace only one diagram first.
2. Run `forester build forest.toml`.
3. Inspect `output/math-blog/<TREE_ID>/index.xml` for `html:figure` and `html:img`.
4. Open the page locally and visually check the diagram.
5. Convert remaining diagrams only after the first one succeeds.

