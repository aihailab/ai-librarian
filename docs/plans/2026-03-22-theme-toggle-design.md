# Theme Toggle Design

**Problem:** Older users report the current dark UI is hard to read. The product needs a light theme that preserves contrast and keeps the interface understandable.

**Decision:** Add a shared light/dark theme toggle on the home page and the main navbar. Default new sessions to the light theme and persist the user's choice in `localStorage`.

## Goals

- Make the light theme the default experience.
- Keep a dark theme available for users who prefer it.
- Ensure major surfaces, text, borders, and controls are recolored for the light theme rather than only flipping the page background.
- Keep theme state synchronized across the home page and librarian page.

## Visual Direction

- Light theme uses a warm off-white page background, white cards, deep gray text, medium-gray secondary text, soft gray borders, and accessible blue accents.
- Dark theme remains available and is expressed through the same semantic theme tokens.
- The toggle uses explicit labels and icon support so it is understandable for older users.

## Architecture

- Introduce a shared `ThemeProvider` with a `useTheme()` hook.
- Store the active theme in `localStorage` under a single key.
- Apply the theme to `document.documentElement` with `data-theme="light"` or `data-theme="dark"`.
- Define semantic CSS variables in `index.css` for backgrounds, text, borders, overlays, and accent surfaces.
- Update core UI components to reference theme-aware classes or variables instead of hard-coded `neutral-*` dark classes.

## Affected Surfaces

- Home page hero and top-right toggle
- Navbar and footer
- Librarian cards and panels
- Message list bubbles
- Chat input, config modal, popover
- Tools section and Live2D area

## Persistence Rules

- If no saved theme exists, default to `light`.
- If a saved theme exists, restore it on load.
- Theme changes should update the whole app immediately and remain after refresh.

## Verification

- Build succeeds.
- Lint succeeds.
- Theme defaults to light in a fresh session.
- Theme selection persists after navigation and refresh.
