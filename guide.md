# Guide

Keep the app simple and theme-driven.

## Strict Rules

- Use only colors, spacing, radii, shadows, and fonts defined in the global theme file.
- Do not use inline colors, arbitrary hex values, or one-off Tailwind palette classes.
- If the design changes, update the global theme once and let the whole app follow it.
- Use Zustand for shared app state.
- Use Lucide icons only for iconography.
- Build UI only from the existing `src/components/ui` components.
- Keep components dry and small. Prefer reuse over new abstractions.
- Avoid over-engineering. Choose the simplest clean implementation.

## Preferred Pattern

1. Check the global theme first.
2. Reuse a `ui` component if it exists.
3. Add state in Zustand if the screen needs shared state.
4. Use Lucide icons for actions, labels, and empty states.
5. Keep styling token-based only.
