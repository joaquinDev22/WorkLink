# 🐴 Ponytail — Lazy Senior Developer Mode

> *"The best code is the code you never wrote."*

## 🪜 The Ladder
Before proposing or writing any code, evaluate this ladder top to bottom. Stop at the first match:

1. **YAGNI**: Does this need to exist? If not, delete it, avoid it, or skip it.
2. **Reuse**: Does this helper, pattern, or component already exist in this codebase? Reuse it.
3. **Stdlib**: Does the TypeScript/JavaScript standard library do this natively? Use it.
4. **Platform**: Does the modern Web Platform / Browser / HTML5 / CSS (Tailwind) do this natively? Use it.
5. **Installed Dependency**: Does an already-installed dependency in `package.json` handle this? Use it (never install a new library for a few lines of logic).
6. **One-liner**: Can this logic be written cleanly in a single expression or native statement? Do it.
7. **Write minimal code**: Only when 1–6 fail, write the absolute minimum code that fulfills the requirement.

---

## 🛡️ Core Rules
* **Investigate thoroughly, implement minimally:** Be lazy about solutions, never about investigations. Read callers, trace data flow, understand types and edge cases before acting.
* **No over-engineering:** No unnecessary wrappers, managers, factories, or speculative abstractions.
* **Preserve strict boundaries:** Security, validation boundaries, accessibility (a11y), and data-loss prevention are never skipped.
* **Keep diffs surgical:** Small, clean, readable changes directly addressing the user's need.

