# Theme Forge Project Instructions

## Project Overview

Theme Forge is a browser-based application built with plain HTML, CSS, and JavaScript.

The project prioritizes simplicity, maintainability, and readability over clever abstractions.

Avoid introducing frameworks, build systems, transpilers, or additional dependencies unless explicitly requested.

---

## Theme Architecture

- HSL is the canonical color model for theme tokens.
- Each color token should preserve `h`, `s`, `l`, `a`, and `locked`.
- HEX and RGB are derived formats, not the source of truth.
- Preserve HSL values even when `l = 0`, `s = 0`, or `a = 0`; hue and saturation should not be lost when a color temporarily becomes black, white, gray, or fully transparent.
- Only the preview area is themed. The app shell, header, sidebar, and control UI should remain stable and usable unless theme-aware app chrome is explicitly discussed later.

---

## Export Direction

- Theme export should eventually support JSON, CSS, SCSS, HEX, RGB, and HSL.
- JSON export should preserve the full token state, including lock flags.
- CSS and SCSS exports should be derived from the canonical HSL token state.

---

## Near-Term Priorities

- Wire up the advertised workflow buttons: Undo, Redo, Randomize, Export CSS, and Export JSON.
- Add UI support for locked color tokens.
- Improve accessibility reporting beyond the current score.
- Make theme state more portable through import/export and presets.
- Expand preview components carefully as a design-system stress test.

---

## Working Style

- Inspect existing code before proposing changes.
- Preserve established project patterns whenever practical.
- Prefer small, focused changes over broad rewrites.
- Do not refactor unrelated code while implementing a feature.
- Explain significant architectural concerns before changing them.
- Ask before introducing new libraries or dependencies.
- When multiple solutions exist, prefer the simplest maintainable option.

---

## User Preferences

- The user's name is Michael.
- Michael prefers conversational communication.
- Michael prefers step-by-step troubleshooting.
- Michael values practical solutions over theoretical elegance.
- Michael generally prefers incremental improvements rather than large-scale redesigns.
- Michael likes to understand why a change is being made.
- Michael dislikes unnecessary complexity and over-engineering.

---

## JavaScript Standards

- Use modern vanilla JavaScript.
- Follow existing project conventions.
- Prefer readable code over clever code.
- Avoid introducing abstraction layers unless they solve a real problem.
- Reuse existing utilities and patterns when appropriate.
- Keep functions focused and understandable.

---

## CSS Standards

- Maintain existing visual behavior unless specifically asked to change it.
- Group related styles together.
- Add section comments when they improve navigation.
- Remove dead code only when it is clearly unused.
- Avoid cosmetic refactors that create large diffs without meaningful benefit.

---

## Feature Development Process

For new features:

1. Identify the files involved.
2. Briefly explain the proposed implementation.
3. Make the smallest safe set of changes.
4. Summarize changed files.
5. Suggest testing steps.

For uncertain requirements:

- Ask questions rather than guessing.
- State assumptions clearly.

---

## Refactoring Rules

Refactoring is encouraged when it provides clear value.

However:

- Preserve behavior.
- Preserve user workflows.
- Avoid "cleanup" changes unrelated to the current task.
- Avoid moving code simply for stylistic reasons.
- Prefer easy-to-review diffs.

---

## Technical Debt Reviews

When asked to review the project:

- Separate observations from recommendations.
- Identify dead code, duplication, and maintainability issues.
- Do not automatically fix issues unless requested.
- Provide a prioritized list of improvements.

---

## Git

Do not create commits unless explicitly requested.

Commits and pushes should use a two-step approval process:

1. When Michael asks for a commit or push, inspect the current status and diff first.
2. Propose the exact commit message before committing. Michael prefers verbose commit messages.
3. Wait for Michael to approve or revise the message.
4. Only after approval, create the commit and sync/push if requested.

When preparing commit recommendations:

- Summarize what changed.
- Focus on user-visible or architectural impact.
- Keep the commit subject concise and the commit body descriptive.
