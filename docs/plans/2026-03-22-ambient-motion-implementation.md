# Ambient Motion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add subtle ambient motion, cursor glow, and refined hover transitions while preserving readability and calm interaction.

**Architecture:** Introduce one global background motion layer that updates cursor position through CSS variables on the root element. Extend existing theme-aware CSS classes so motion is applied consistently across both themes without adding per-component animation logic.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, CSS variables

---

### Task 1: Add a shared ambient layer

**Files:**
- Create: `frontend/src/components/AmbientMotionLayer.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Create the layer component**

Add a fixed, pointer-events-none layer that updates root cursor CSS variables from mouse movement using `requestAnimationFrame`.

**Step 2: Mount it once**

Render the layer near the app root so it affects all routes and themes.

### Task 2: Add theme-aware motion tokens and transitions

**Files:**
- Modify: `frontend/src/index.css`

**Step 1: Add ambient color tokens**

Define motion-specific variables for glow intensity and background orb colors in both themes.

**Step 2: Add motion classes**

Create styles for the ambient layer, drifting orbs, cursor glow, surface hover transitions, and theme transitions.

### Task 3: Apply motion to key surfaces

**Files:**
- Modify: `frontend/src/Home.tsx`
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/pages/Librarian.tsx`

**Step 1: Keep content above the ambient layer**

Ensure main content remains visually above the background layer.

**Step 2: Add subtle hover-friendly classes**

Apply shared interactive motion classes to the most important surfaces and controls.

### Task 4: Verify

**Files:**
- Review only

**Step 1: Run TypeScript build**

Run: `./node_modules/.bin/tsc -b`

Expected: success.

**Step 2: Review diff**

Run: `git diff -- docs/plans/2026-03-22-ambient-motion-design.md docs/plans/2026-03-22-ambient-motion-implementation.md frontend/src`

Expected: only ambient motion design, implementation, and styling changes.
