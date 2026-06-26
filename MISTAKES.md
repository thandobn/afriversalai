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
