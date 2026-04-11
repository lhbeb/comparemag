Project Status (Non-Negotiable Context)

This project is already working in production

Any current failure is caused only by the most recent change

Existing code represents validated, intentional behavior

You are not allowed to reinterpret, simplify, or improve past decisions.

Absolute Scope Rules

Fix only what is explicitly mentioned in:

the build error

the provided log

the file(s) named in the error

Do not modify files, functions, or components not directly implicated

Do not refactor, reorganize, rename, or delete anything

Do not remove features, even temporarily

Do not “clean up”, “optimize”, or “modernize” code

If a fix requires touching unrelated code, STOP and ask first.

Change Philosophy (Mandatory)

Apply the smallest possible change

Prefer additive or localized patches

Assume all existing code is intentional and correct

Treat existing APIs, props, and exports as immutable contracts

This is a surgical fix, not a rewrite.

Build-Error-Only Mode (IMPORTANT)

When solving a build or Vercel deployment error:

You are operating in Build-Error-Only Mode

Your goal is to:

make the build pass

without changing runtime behavior

Do not remove code to “get the build green”

Do not comment out features

Do not bypass errors by deleting logic

If the error cannot be fixed without changing behavior, ask before proceeding.

Mobile-First & Responsiveness (Hard Constraints)
Design Principle

Mobile-first is mandatory

Desktop is an enhancement, not the base

Stability Requirements

Layout must be visually stable at:

320px

375px

390px

768px

1024px+

The Following Must Never Happen

Buttons splitting into multiple lines

Button text wrapping or truncating

Icons misaligning vertically

Elements overflowing the viewport

Awkward or accidental line breaks at 320px–768px

Horizontal scrolling at any breakpoint

Defensive Layout Rules

flex-wrap only when intentional

Use min-width: 0 where required

Avoid fixed widths for text containers

Use gap instead of margins

Buttons must use white-space: nowrap

All interactive elements must remain tappable at 320px

Responsiveness Guard (Always Enforced)

No desktop assumptions

No layout regressions

No new breakpoints unless explicitly requested

No typography changes unless explicitly requested

Visually test at:

320px

375px

768px
before finalizing

Preservation Rules

The following must remain unchanged unless explicitly instructed:

Existing layout structure

Existing breakpoints

Component APIs and props

Function names and signatures

Feature behavior implemented before the last change

Assumptions & Uncertainty

Do not assume intent

Do not infer missing requirements

If something is unclear or risky, ask before changing

Silence is not consent to refactor.

Mandatory Self-Audit (Before Responding)

Before producing a solution:

Verify no unrelated code was changed

Verify no features were removed or altered

Verify the fix is limited to the reported error

If unsure, explicitly state uncertainty instead of guessing

Final Rule

Preserve the past. Fix the present. Do not redesign history.