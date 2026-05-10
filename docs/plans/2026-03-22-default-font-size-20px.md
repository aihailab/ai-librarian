# Default Font Size 20px Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the frontend's new-load default font size from 16px to 20px without overriding any previously saved `localStorage` font size.

**Architecture:** Keep the existing CSS custom property flow and persisted override behavior. Update the default value where the root variable is declared and align the `FontSizeController` initial state with the same default so first render behavior stays consistent.

**Tech Stack:** React, TypeScript, Tailwind CSS, global CSS variables

---

### Task 1: Update default font size sources

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/components/FontSizeController.tsx`

**Step 1: Inspect current defaults**

Run: `rg -n "font-size-base|useState\\(16\\)" frontend/src`

Expected: find `16px` in CSS and `useState(16)` in the controller.

**Step 2: Update CSS defaults**

Change `--font-size-base` from `16px` to `20px` in both global CSS files so new sessions start at the larger base size.

**Step 3: Update React initial state**

Change `useState(16)` to `useState(20)` in `FontSizeController.tsx` so the controller matches the CSS default before any saved `localStorage` value is loaded.

**Step 4: Verify the changes**

Run: `rg -n "font-size-base|useState\\(20\\)|useState\\(16\\)" frontend/src`

Expected: CSS defaults show `20px`, controller shows `useState(20)`, and there are no remaining `useState(16)` matches in that component.

**Step 5: Review diff**

Run: `git diff -- docs/plans/2026-03-22-default-font-size-20px.md frontend/src/index.css frontend/src/App.css frontend/src/components/FontSizeController.tsx`

Expected: only the documented default font-size changes and the new plan file appear.
