# Evergreen Atomic Notes Skill

Use this skill when organizing, refactoring, or adding notes to this Forester blog. The goal is to make the forest behave like a body of evergreen mathematical notes rather than a linear textbook.

## Core Principle

Prefer many small, permanent, evolving notes over long chapter-like pages.

An evergreen note should:

- Capture one mathematical idea.
- Contain enough explicit context to be understandable without climbing upward in the hierarchy.
- Link to its real dependencies instead of relying on previous paragraphs.
- Be reusable in multiple narratives, outlines, lectures, or chapters.

Hierarchy is allowed, but it should be an imposed narrative over an associative network, not the place where meaning is hidden.

## Atomicity Checklist

Before writing or editing a note, ask:

- Does this note say one thing?
- Could the note be understood by reading it and recursively following its links?
- Are all nontrivial terms linked or recalled?
- Are all variables and assumptions introduced locally?
- Is the note reusable outside its current outline?
- Is the hierarchy relatively flat?
- Is the page an atomic note, or is it really an outline note?

If a page has many headings such as "examples", "semantic interpretation", "model category", "applications", it is probably an outline note or should be split.

## No Free Variables

Do not rely on one-off objects introduced only by an ancestor page.

Bad:

```text
Now define a model of T in C...
```

Good:

```text
Let T be an algebraic theory and let C be a category with finite products. A model of T in C is...
```

Every atomic note should reintroduce its own main symbols unless they are genuinely universal notation.

## Explicit Dependencies

When using a notion defined elsewhere, link it.

Examples:

- Use `[代数理论](003C)` instead of assuming the reader remembers what `T` means.
- Use `[签名与项](003D)` before discussing equations between terms.
- Use `[有限积范畴中的内部群](003J)` before discussing internal group homomorphisms.

Do not link every common word. Prefer linking:

- Definitions
- Constructions
- Theorems
- Nonstandard notation
- Pages that decode a recurring symbol

If inline linking would be noisy, rely on Forester's generated bottom "Related" and "Backlinks" sections rather than adding a manual "相关页面" block in the main text.

## Decodable Notation

Notation should be locally decodable.

For example, a note using:

```tex
\operatorname{Mod}(\mathbb{T},\mathcal{C})
```

should either define it locally or link to a page that does.

When a symbol has multiple possible meanings, say which one is meant.

## Outline Notes

Use outline notes to impose a narrative over atomic notes.

An outline note should:

- Be relatively short.
- List child notes in a purposeful reading order.
- Explain why this narrative is useful.
- Avoid duplicating the full content of child notes.

Good outline note shape:

```forester
\title{代数理论：语法与语义}
\taxon{Outline}

\p{这一页组织代数理论的语法侧内容。}

\ol{
  \li{[代数理论](003C)}
  \li{[签名与项](003D)}
  \li{[群论的等式公理化](003E)}
}
```

## Hierarchy

Prefer relative, explicit, and flat hierarchy.

- Relative: a node's level is determined by the outline that embeds it, not by the node itself.
- Explicit: hierarchy should be visible through links or transclusion, not inferred from absolute heading levels.
- Flat: use hierarchy for broad navigation, not for every tiny dependency.

Avoid deep nesting unless the nesting itself is mathematically meaningful.

## Reorganization Workflow

When refactoring existing notes:

1. Identify long pages that contain several independent ideas.
2. Split each independent idea into an atomic `.tree`.
3. Rewrite the original long page as an outline note linking the new atomic notes.
4. Add explicit dependency links between atomic notes.
5. Keep old IDs as outline pages when possible, so existing links remain valid.
6. Run `forester build forest.toml`.
7. Check generated pages for broken links and formula rendering.

## Writing Style For Atomic Math Notes

Use this shape by default:

```forester
\title{Single idea}
\date{YYYY-MM-DD}
\taxon{Definition}
\author{author}

\p{Local context and definition.}

\p{One or two consequences, examples, or decoding remarks.}
```

Prefer short prose paragraphs over textbook-style long exposition.
Do not add a manual "相关页面" section immediately after the main text; the rendered site already provides bottom navigation through generated backlinks and related notes.

## Responsibility And Authorship

For this blog, keep authorship simple:

- Use `\author{author}` for notes written or substantially integrated here.
- When importing or paraphrasing outside material, mention the source in prose if it matters.
- Do not imply responsibility for future recontextualizations of a transcluded or linked note.

## Anti-Patterns

Avoid:

- A definition whose variables were introduced only in a parent page.
- A theorem statement that requires reading five previous sections.
- Long "chapter" pages containing many definitions and examples.
- Hard-coded hierarchical assumptions like "above", "previous section", or "later chapter" unless the note is explicitly an outline.
- Repeating entire definitions instead of linking to atomic notes.
- Manual "相关页面" blocks that duplicate generated backlinks or related notes.
- Prematurely deep folder or outline structures.
