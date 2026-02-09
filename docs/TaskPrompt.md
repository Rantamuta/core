# Task Prompt

You are an agentic maintainer for this repository. Follow AGENTS.md strictly.

Reference documents:
- AGENTS.md (governance and constraints)
- README.mkd#10-maintenance-checklist
- docs/ComplexityScale.md (task sizing rules)

Goal
Advance the 1.0 maintenance checklist by addressing exactly ONE unchecked item, or by decomposing it if it is not atomic.

---

## Phase 0 — Select task
- Choose one unchecked checklist item with the best impact-to-effort ratio under maintenance constraints.
- Quote the checklist item verbatim.
- Do not change any code in this phase.

---

## Phase 0.01 — Restate the task (goal confirmation)
- Restate the selected checklist item in your own words as a concrete, testable goal.
- Include:
  - what must be true when the task is complete
  - what is explicitly out of scope
- Limit to 2–3 sentences.
- Do not propose solutions or plans yet.

---

## Phase 0.02 — Define the invariant (mandatory)
Define the exact property this task enforces.

Invariant:
- Write ONE sentence describing the property that must always hold once the task is complete.

Acceptable approximations:
- List EXACTLY 2–3 bullets describing what this task intentionally covers or approximates.

Unacceptable outcomes:
- List EXACTLY 2–3 bullets describing false positives or negatives this task must NOT introduce.

Do not propose implementation yet.

---

## Phase 0.03 — Size the task (mandatory gate)
Using docs/ComplexityScale.md:

- Assign a complexity score (Fibonacci: 1, 2, 3, 5, 8, 13, 21).
- Classify the task as:
  - Atomic (≤ 8), or
  - Epic (≥ 13).
- Provide a one-sentence justification referencing:
  - number of files/subsystems touched
  - verification complexity
  - behavior risk

Rules:
- Tasks scored 13 or higher MUST be decomposed.
- Do not proceed to implementation planning for Epic tasks.

If Epic:
- Propose a breakdown into 3–8 atomic checklist items.
- For each subtask:
  - one-sentence description
  - expected complexity score
  - exact “done when” condition
  - primary verification command
- Recommend which subtask should be tackled first and why.
- STOP for human review.

If Atomic:
- Proceed to Phase 1.

---

## Phase 1 — Audit (no edits)
- Identify the minimal set of files and paths involved.
- Describe current behavior with references to file paths and functions.
- List explicit constraints (what must not change).
- List unknowns that must be resolved by tests rather than assumptions.
- Do not propose changes yet.

---

## Phase 2 — Plan (least intrusive, mechanically specific)

- Propose the least intrusive plan that satisfies the invariant.
- The plan MUST be concrete enough that another maintainer could implement it without interpretation.

Structure (mandatory):

### 2.1 Edit inventory (no prose)
List EVERY intended code touch explicitly.
For each item:
- file path
- exact symbol(s) to be edited (function, class, method, constant)
- nature of change: add | modify | remove

If a file or symbol is not listed here, it must NOT be edited later.

### 2.2 Ordered execution steps
Provide an ordered list of steps (minimum 6, maximum 12).
For EACH step, specify:
- files touched (must match the edit inventory)
- exact action (what is written, moved, or guarded)
- expected behavior impact:
  - none (pure refactor or test scaffolding)
  - guarded (new behavior behind a condition)
  - potential (externally observable change)
- exact verification command(s) to run after this step
- what observable signal confirms success (test name, output change, error message, etc.)

Avoid vague verbs (e.g. “refactor”, “fix”, “handle”) unless paired with a concrete edit target.

### 2.3 Negative and non-goal coverage
Explicitly list:
- at least one negative scenario the plan must correctly reject or error on
- at least one closely related behavior that must NOT change

### 2.4 Rollback plan
- Describe how to revert the change safely if a regression is discovered.
- Include the minimal set of commits or files that would be reverted.

Verification rules:
- Prefer `npm test` and `npm run ci:local`.
- Verification MUST reflect how this repo is actually consumed.
- Do NOT use `npm pack` unless this repository is explicitly intended for npm publication as part of the approved task.
---

## Phase 3 — Pre-mortem
- List the top 3 plausible failure modes or accidental behavior changes.
- For each, explain how the plan and tests detect or prevent it.

The following implementation phases MUST adhere strictly to this plan unless a deviation is explicitly approved.

STOP for human review after Phases 0–3.

---

## Phase 4 — Test-driven lock-in (MANDATORY RED)

After approval:

### Phase 4A — Red (change-driving tests only)
- Implement ONLY tests that encode the invariant and the new intended behavior.
- Do NOT implement functional or production code changes.
- Run `npm test`.

Requirements:
- At least one new test MUST FAIL.
- The failure MUST be:
  - an assertion or expectation failure, not a crash
  - directly tied to the invariant being enforced
- Report:
  - failing test name(s)
  - exact failure message(s)
  - a brief statement explaining why this failure is correct and expected

### Phase 4B — Characterization or scaffolding (optional)
If necessary to proceed safely:
- Add tests, CI adjustments, or tooling that characterize existing behavior.
- These tests MUST PASS.
- They MUST NOT eliminate the failing test from Phase 4A.

Do NOT implement functional changes in this phase.

STOP for human review.

---

## Phase 5 — Implement the change
After approval:
- First step: MUST update the selected README checklist item to `[x]` (unless the approver explicitly defers it).
- Implement the planned change in minimal commits (one logical change per commit).
- Ensure:
  - `npm test` passes
  - `npm run ci:local` passes

---

## Phase 6 — Final report
- Summarize what changed (3 bullets max).
- Provide exact verification commands.
- State the checklist item status update.
- List any follow-up TODOs discovered (do not act on them).
  
