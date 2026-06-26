# AfriversalAI / Funda — Mistakes & Lessons Learned

> Log of what went wrong and what to do differently. Read at session start.

---

## 2026-06-21

**Lesson:** Created HANDOFF.md in the wrong directory (`course-poc/` instead of `Funda/`)
**Why it happened:** Searched for HANDOFF.md only inside the project subfolder (`course-poc/`) without checking the parent. Assumed the file lived next to the code.
**What to do instead:** Always Glob for `**/HANDOFF.md` from the workspace root before creating a new one. The handoff lives at `C:\Users\thand\Workspace\Funda\HANDOFF.md`.

---

**Lesson:** `replace_all` on image `object-position` styles applied to all 21 resource cards, including books and reports that didn't need it
**Why it happened:** Used `replace_all: true` on a pattern that matched too broadly — all cards shared the same base class and property.
**What to do instead:** Use CSS modifier classes (`.res-card__cover--center`, `--left`, `--bottom`) added only to the specific cards that need them, not inline styles that get replaced globally.

---

**Lesson:** `&&` command chaining doesn't work in Windows PowerShell 5.1
**Why it happened:** Kept defaulting to bash-style `&&` for sequential commands.
**What to do instead:** Always use `;` to chain PowerShell commands. `&&` is a parser error in PS5.1 — it silently breaks the second command or throws.

---

**Lesson:** module-0 container bug (Phases 2–4 rendering full-width) shipped before it was caught
**Why it happened:** The `<div class="container">` closed after Phase 1 only. The visual difference only showed up in the browser at wider viewports — not obvious from reading HTML alone.
**What to do instead:** After any structural HTML change (moving sections, adding phases), visually verify at full desktop width in the browser before committing. Container scope bugs are invisible in narrow mobile views.

---

**Lesson:** 3Blue1Brown image `object-position: center bottom` overcorrected — showed only the black bottom of the image
**Why it happened:** Went too far trying to shift the logo into frame. `bottom` is 100% — way past the content.
**What to do instead:** For subtle crop adjustments, use percentage values (e.g., `65%`) rather than keyword extremes (`top`, `bottom`, `left`, `right`). Test visually before committing.

---

## 2026-06-26

**Lesson:** GoDaddy forwarding destination for `.co.za` was initially typed as `afriversalai.ai` (wrong) instead of `afriversal.ai` (correct)
**Why it happened:** The domain name `afriversal` and the TLD `.ai` look similar to `afriversalai` in a small text field — easy to type the brand name instead of just the domain. The GoDaddy table truncates URLs so it wasn't visible until hovering for the tooltip.
**What to do instead:** After saving any domain forward in GoDaddy, always hover over the truncated destination URL to read the full tooltip before moving on. Verify the exact string, not just that it looks roughly right.
