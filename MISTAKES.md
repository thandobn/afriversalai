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

---

**Lesson:** Recommended Amazon WorkMail ($4/month) as an email hosting option without verifying it was still available — it's discontinued for new signups.
**Why it happened:** Assumed a major AWS service was still active without checking current availability. The user navigated to the console and got blocked.
**What to do instead:** Before recommending any external service (especially cloud/SaaS), flag uncertainty about current availability explicitly. "I believe X is available but let me confirm" beats sending the user to a dead console.

---

**Lesson:** Sent user to scroll through the Google Account Security UI to find App Passwords — it's hidden from the UI on many accounts even with 2FA on.
**Why it happened:** Assumed the standard navigation path (Security page → scroll down) would surface the option.
**What to do instead:** Go directly to `myaccount.google.com/apppasswords` — skip the Security page navigation entirely. This is the reliable path regardless of account UI variant.

---

**Lesson:** Gmail App Password authentication failed on first attempt because the password was pasted with spaces (Google displays as `xxxx xxxx xxxx xxxx`).
**Why it happened:** Didn't proactively warn that SMTP requires the password without spaces before the user hit the error.
**What to do instead:** Before the user clicks "Add Account" on any SMTP dialog with an App Password, explicitly say: "Make sure there are no spaces — Google shows it in groups of 4 but SMTP needs it as one continuous string."

---

**Lesson:** Didn't know DNS for `afriversal.ai` was on Namecheap — had to be corrected by the user mid-session ("its a namecheap i thought you knew that").
**Why it happened:** Infrastructure details weren't in project memory; I assumed Route 53 without checking.
**What to do instead:** Infrastructure ownership (who holds DNS for each domain) belongs in project memory from the moment it's established. Read `project_afriversalai.md` at session start and never assume AWS/Route 53 without confirming the registrar first.

---

**Lesson:** Admin bypass returned early before progress restore ran, leaving phase tracker steps unclickable (no `is-done` class set).
**Why it happened:** The bypass correctly showed module content but exited before the loop that marks tracker steps as done — meaning admins couldn't click phases 2-4 even though the content was visible.
**What to do instead:** Any admin early-return that reveals module content must also mark all tracker steps as `is-done` so phase navigation works. Always test admin navigation end-to-end (open module → click each phase step) not just that the gate bypasses.

---

## 2026-06-26 (session 2)

**Lesson:** PowerShell's `Get-Content`/`Set-Content` without explicit encoding corrupted every emoji and multi-byte character in 12 HTML files.
**Why it happened:** Used `Get-Content -Raw` and `Set-Content` with the default encoding, which in PowerShell 5.1 on Windows is the system code page (Windows-1252). UTF-8 emoji bytes were misread and then written back as garbage characters (e.g. `🏢` → `ðŸ¢`). The error was silent — "Done. 12 files updated" — with no warning.
**What to do instead:** For any bulk text operation on files containing non-ASCII characters, always use `[System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)` and `[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)`. Or use Python. Never use `Get-Content`/`Set-Content` on HTML/JS files without `-Encoding utf8` — and even then, PS5.1's `-Encoding utf8` writes a BOM, which can also cause issues. The safe default is always the .NET IO class with explicit encoding.

---

## 2026-06-26 (session 3)

**Lesson:** `getProfile()` 42703 fallback SELECT still included the missing columns (`email`, `org_code`), making the fallback useless — same error.
**Why it happened:** When writing the fallback I copied the column list from the primary SELECT and only removed `role`, not thinking through which columns were actually confirmed to exist.
**What to do instead:** A 42703 fallback must only select columns you have direct evidence exist (e.g. from a `select('*')` diagnostic or the original CREATE TABLE). Never copy-paste the failing SELECT into the fallback with one column removed.

---

**Lesson:** Added `await _loadAdminEmails()` inside `getSession()`'s try-catch without a `.catch()` guard — any unexpected throw from `_loadAdminEmails` would silently null out the session and break every auth-gated page.
**Why it happened:** `_loadAdminEmails` handles its own Supabase errors, so I assumed it was safe. But unexpected runtime errors (not Supabase errors) still propagate.
**What to do instead:** Any `await` inside a function with a catch-all `try/catch { return null }` must be wrapped in `.catch()` if a failure there should NOT null the return value. Use `await fn().catch(e => console.error(e))` pattern.

---

**Lesson:** `getProfile()` SELECT included columns (`role`, `email`, `org_code`) that were added to the migration file but never actually run in Supabase, causing silent 42703 failures for months.
**Why it happened:** Code and DB migration were written together but the migration was never run. There was no mechanism to catch the mismatch at deploy time.
**What to do instead:** Whenever a column is added to a SELECT in `getProfile()` or similar, add a note in the commit message: "requires migration step X to be run in Supabase." The code change and DB migration must ship together or the SELECT will fail silently.

---

**Lesson:** `:first-child` CSS selector on `.gloss-letter` never matched because the hidden `.gloss-no-results` paragraph was the actual first child of `.gloss-body`.
**Why it happened:** Wrote `:first-child` based on visual/logical order (first visible letter), not DOM order. `display: none` elements still occupy their DOM position for selector purposes.
**What to do instead:** Use adjacent sibling selector `.preceding-element + .target { margin-top: 0 }` when the first visible item isn't the first DOM child. `:first-child` only works when the target element is truly the first node in the parent.

---

**Lesson:** After `ALTER TABLE ADD COLUMN`, PostgREST cached the old schema causing `getProfile()` to still fail with 42703 for ~60 seconds after the column was added.
**Why it happened:** Didn't know PostgREST has a schema cache TTL.
**What to do instead:** After any schema change in Supabase, immediately run `NOTIFY pgrst, 'reload schema';` in the SQL editor to force an instant cache refresh. Don't rely on the TTL expiring.

---

## 2026-06-27

**Lesson:** After context compaction, all file read states are reset — Edit tool fails with "file has not been read yet" on every file, even ones read earlier in the session.
**Why it happened:** Context compaction starts a fresh context window; the Edit tool's read-state tracking doesn't carry over.
**What to do instead:** After any context compaction, treat every file as unread. Re-read at the specific offset you need before editing. Trying to batch-edit without re-reading will fail for every file in the batch.

---

**Lesson:** Pre-existing unstaged changes block `git pull --rebase` — the rebase refuses to run and errors with "You have unstaged changes."
**Why it happened:** `style.css` had uncommitted changes from a previous session (partner portal work) that were never staged. Tried to pull before noticing.
**What to do instead:** At the start of any push flow, run `git stash` first if `git status` shows unstaged changes you didn't create this session. Then pull --rebase, push, and `git stash pop`. Make it a standard step on this repo.

---

## 2026-06-27

**Lesson:** Used `module-card__case` (a pill/bubble class) for the module taglines instead of plain bold text
**Why it happened:** User asked for "same look as Module 0" — I matched the class without asking whether they wanted a pill or just bold colored text. Module 0's pill is subtle on its gold background; on white cards it looks like a distinct bubble.
**What to do instead:** When reusing a CSS class for a new element, check what it actually renders like in the target context. If there's any ambiguity between "styled text" and "pill", confirm before implementing.

---

**Lesson:** Diagnosed opportunity registrations not showing in admin as "missing RLS policies only" — that was one of two root causes, not the only one
**Why it happened:** Fixed the RLS gap first (correct), but didn't immediately flag that demo-mode submissions go to localStorage and will never appear in Supabase regardless of policies. User had to go through the full cycle before the second root cause surfaced.
**What to do instead:** When debugging a data-not-showing issue on this project, always check demo mode first: `SELECT * FROM [table]` — if empty, the data never reached Supabase. Suspect localStorage before suspecting policies.

---

## 2026-06-28

**Lesson:** Started a multi-phase council review (5 experts, 4 module phases) without reading the full target file first — context compaction hit mid-review, requiring a full re-read in the next session.
**Why it happened:** Read the module in chunks as each expert's Phase 1 review was being written, instead of front-loading all reads before writing any review.
**What to do instead:** For any structured multi-expert review, read ALL target file sections before writing the first blind review. The entire read phase must complete before Phase 3 starts — otherwise compaction mid-review forces expensive re-reads and breaks the blind-review isolation window.

---

**Lesson:** Plan file (eager-launching-hopper.md) had 17 items from prior sessions that were already implemented — discovered only by reading each target file during execution.
**Why it happened:** Plan status wasn't updated after each session that completed items; the plan was append-only, never updated with completion status.
**What to do instead:** At the end of every session that addresses plan items, mark each completed item directly in the plan file (add "✅ DONE — [date]" inline). The next session should be able to scan the plan and immediately know what's left without re-reading every target file to find out.

