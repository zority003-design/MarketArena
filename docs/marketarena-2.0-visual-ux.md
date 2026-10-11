# MarketArena 2.0 — Visual System and UX Specification

This document translates the design direction into practical rules for implementation. It is not permission to replace the map with a static illustration or to ship generated concept art as the game itself.

## 1. Experience goal

The game should feel like a premium strategy title presented in a browser, not a financial dashboard. The map is the main interface. Panels exist to explain and enable decisions about the selected place.

A player should be able to answer immediately:
- Whose territory is this?
- What can I buy or improve?
- What will it earn?
- What is my rival trying to do?
- What is the next useful move?

## 2. Screen hierarchy

### Main match screen
- **Top HUD:** turn, cash, net income per turn, current leader.
- **Center:** large interactive isometric map; target 65–75% of available viewport width.
- **Left rail:** only four destinations: World, Empire, Rivals, Objectives. Can collapse on small screens.
- **Right context panel:** selected city/business/rival; only one contextual panel at a time.
- **Bottom/edge action:** a persistent, prominent End Turn control with a preview of pending income/rival moves.
- **Activity feed:** last 3 events, expandable; never the main visual focus.
- **Next Move:** one recommendation with a "Show on map" action.

### Landing screen
One strong key-art composition and three primary actions: New Game, Continue, How to Play. Avoid analytics cards and a dozen navigation items. Include a short statement of the objective.

### New game flow
1. Difficulty.
2. Starting leader or region.
3. Match length / victory target (default values selected).
Keep advanced rules behind "More settings". Avoid a long setup wizard.

## 3. Interaction rules
- Clicking a city selects it and opens a concise panel.
- Clicking a business shows cost, income per turn, upkeep, simple payback estimate, synergy, and Buy/Upgrade action.
- Clicking an owned site shows its level, income, upgrade choices, and ownership.
- Clicking a rival shows their cash band, empire value, personality, threat level, and recent move.
- Clicking a news item focuses the affected location and explains the effect.
- Every action previews its impact before confirmation when it can materially affect the match.
- The player never needs to navigate to a separate section just to buy or upgrade a visible object.
- All hover interactions have click/tap equivalents.

## 4. Plain-language copy

Prefer:
- "Earns +90 each turn"
- "Costs 600"
- "Upgrade: +35 income each turn"
- "Needs a farm connection"
- "Rival is targeting this city"
- "Control 2 of 3 key sites to influence this city"

Avoid as primary copy:
- ROI, EBITDA, yield, market capitalization, net present value, volatility index, portfolio allocation.
Advanced terms may appear in optional detail views only.

## 5. Map quality bar

### Required visual layers
1. Terrain base: coast, plains, hills, forest, rivers.
2. Country boundaries: subtle and consistent.
3. Roads and rail: clean paths with junction logic.
4. Cities: coherent building clusters with a distinct silhouette.
5. Business assets: type-readable buildings, not emoji markers.
6. Ownership: material tint, border, flag/banner, or base ring; color alone is insufficient.
7. Interaction: clear hover, selection, reachable/blocked state.
8. Screen-space labels: stable at all zoom levels, with collision handling and sensible decluttering.

### Composition
- One consistent isometric angle and scale.
- A single coherent lighting direction.
- Contact shadows under structures and elevated assets.
- Terrain detail used to guide the eye, not clutter the play area.
- Cities should read as clusters with landmarks, not isolated icons scattered on a flat shape.
- Strategic objects must be visually distinct from decorative scenery.
- At distant zoom levels, aggregate small buildings into district silhouettes.
- At close zoom, reveal business labels and upgrade details.

### Avoid
- hand-drawn childlike coastlines,
- uneven SVG blobs with labels placed by guesswork,
- random emoji as buildings,
- excessive glow and glass cards,
- multiple unrelated art styles,
- illegible labels placed directly over busy terrain,
- using one static AI image as a supposedly interactive map.

## 6. Asset specification

Initial vertical slice asset list:
- 1 base region map (separate layers / geometry),
- 6 terrain materials,
- 3 city silhouettes,
- 8 business buildings with 2–3 upgrade stages where relevant,
- 4 rival portraits,
- 6 event illustrations,
- 12 small UI icons,
- ownership banner / border variants,
- purchase, income, selection, and city-control feedback effects.

Prefer SVG or CSS for UI symbols, and sprite/3D assets for world objects. Do not generate fake issuer/company logos. The map must use selectable data objects with independent positions and ownership state.

## 7. Motion
- Keep most interactions between 120 and 240 ms.
- Purchase animation: asset appears/brightens, short currency delta, success label.
- Income: a concise +amount marker, not an endless shower of coins.
- Rival move: brief map focus and one activity feed entry.
- City influence: territory edge changes smoothly and a small toast explains why.
- Respect reduced-motion preferences.

## 8. Responsive behavior
- Desktop: map remains dominant, panels overlay or dock without squeezing the world.
- Laptop / 1280x720: collapse secondary labels and allow the side rail to collapse; never clip actions.
- Tablet: panels become drawers.
- Mobile: map uses most of the screen; actions open a bottom sheet; critical buttons stay thumb-accessible.
- No horizontal page overflow. Modals must fit within viewport height and remain scrollable.

## 9. UX writing and tutorial
- First objective: "Buy a shop. It earns money every turn."
- Second objective: "End your turn to collect income and let rivals move."
- Third objective: "Control 2 of 3 key sites to influence this city."
- Every tutorial step has one highlighted target and one clear action.
- Never show multiple tutorial modals at once.
- The player can dismiss optional explanation, but the objective stays visible.

## 10. Quality checklist
- [ ] A first-time player can explain the goal after the opening screen.
- [ ] Common actions require at most one map selection and one action click.
- [ ] The next move is clear without opening a separate guide.
- [ ] Ownership is readable without relying only on color.
- [ ] The map's art style is consistent across terrain, buildings, portraits, and UI.
- [ ] Markers remain attached to world objects during pan, zoom, resize, and hover.
- [ ] The interface works at 1920x1080, 1600x900, 1440x900, 1366x768, and 1280x720.
- [ ] Keyboard focus and text contrast are usable.
- [ ] No existing auth, ratings, or saves are silently removed.
- [ ] Type-check and production build pass.
