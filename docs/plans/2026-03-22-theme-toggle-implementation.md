# Theme Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent light/dark theme toggle on the home page and navbar, defaulting new users to the light theme and recoloring major UI surfaces for readability.

**Architecture:** Create a shared theme provider backed by `localStorage` and root `data-theme` attributes. Replace hard-coded dark-surface classes in the core interface with semantic theme tokens and reusable theme-aware component classes.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, CSS variables

---

### Task 1: Introduce shared theme state

**Files:**
- Create: `frontend/src/theme.tsx`
- Create: `frontend/src/components/ThemeToggle.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Add shared theme context**

Create a provider with `theme`, `setTheme`, and `toggleTheme`, storing the selection in `localStorage` and applying `data-theme` to the root element.

**Step 2: Add a reusable toggle**

Create a small labeled toggle component for both the home page and navbar.

**Step 3: Wire the provider into the app**

Wrap app content so every route can read and update the same theme state.

### Task 2: Define semantic theme tokens

**Files:**
- Modify: `frontend/src/index.css`

**Step 1: Add light and dark token sets**

Define page, card, text, border, accent, and overlay variables for both themes.

**Step 2: Add reusable themed component classes**

Create theme-aware classes for nav, panels, inputs, buttons, overlays, and helper text.

### Task 3: Apply theme tokens to major surfaces

**Files:**
- Modify: `frontend/src/Home.tsx`
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/FontSizeController.tsx`
- Modify: `frontend/src/pages/Librarian.tsx`
- Modify: `frontend/src/components/MessageList.tsx`
- Modify: `frontend/src/components/ChatInput.tsx`
- Modify: `frontend/src/components/ConfigModal.tsx`
- Modify: `frontend/src/components/Popover.tsx`
- Modify: `frontend/src/components/ToolsSection.tsx`
- Modify: `frontend/src/components/Live2DArea.tsx`
- Modify: `frontend/src/pages/Placeholder.tsx`

**Step 1: Place the toggle in both entry points**

Add the toggle to the home page and the main navbar.

**Step 2: Replace hard-coded dark classes on key surfaces**

Update cards, panels, bubbles, inputs, buttons, modal, popover, and footer to use semantic theme styling.

### Task 4: Verify behavior

**Files:**
- Review only

**Step 1: Run lint**

Run: `npm run lint`

**Step 2: Run build**

Run: `npm run build`

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-03-22-theme-toggle-design.md docs/plans/2026-03-22-theme-toggle-implementation.md frontend/src`
