# MarketArena 2.0 — Game Design Document
## Working title: Economic Dominion

**Status:** design baseline for the first playable prototype  
**Date:** 2026-10-11  
**Principle:** understandable in 30 seconds, strategically interesting after 30 minutes.

## 1. Product vision

MarketArena becomes a turn-based economic conquest strategy set on an original fictional continent. The player competes against AI magnates for cities, industries, logistics corridors, and national influence. The core fantasy is not "manage a spreadsheet"; it is "build an empire, outplay rivals, and take control of the continent."

The game may take inspiration from the broad appeal of property-trading board games—scarce assets, income, rivalries, readable turns—but must have its own board structure, terminology, art direction, mechanics, and progression. No copied board layout, branding, cards, or visual language.

### Design pillars
1. **Immediate clarity:** one obvious next action, plain-language explanations, minimal navigation.
2. **Competition first:** rivals make meaningful moves and can take assets the player wants.
3. **A world you can read:** ownership, economic activity, and threats are visible on the map.
4. **Short, replayable sessions:** a standard match lasts about 30–40 turns and has a clear finish.
5. **Strategy without finance literacy:** no need to understand real-world stock markets to play.
6. **Consequences are visible:** purchases, upgrades, crises, and takeovers visibly change the world.
7. **Fair challenge:** higher difficulties improve AI decisions and scenario pressure, not just give bots unlimited money.

## 2. The match loop

Each turn follows a consistent rhythm:
1. Income: owned businesses generate revenue and pay operating costs.
2. World update: demand, supply, logistics, and active events are resolved.
3. Rival moves: AI players buy, upgrade, trade, or pursue objectives.
4. Player decision: the player gets a clear action budget (initially 2 action points).
5. Result: map ownership, money, score, and objectives update with visible feedback.

The player can inspect the board at any time, but the End Turn button is always clear and shows what will happen next. The first prototype should avoid real-time timers and simultaneous online play.

### Core actions
- Buy an unowned business or site.
- Upgrade an owned business.
- Connect businesses through a route or supply chain.
- Make an offer to a rival (later milestone).
- Contest a city by acquiring its key assets.
- Use a once-per-turn special action unlocked by a scenario or business type.

Keep the initial action set small. Loans, detailed stock trading, personal life simulation, complex staffing, and deep corporate accounting are not part of the first playable milestone.

## 3. Match setup and difficulty

At new game:
- Choose difficulty: Easy / Standard / Hard / Expert.
- Choose a starting region or one of a few beginner-friendly leaders.
- Start with a 3-step, skippable tutorial integrated into the first turns.
- Start with one modest business, a cash reserve, and a suggested objective.

### Difficulty
- **Easy:** generous reserve, clear previews, rivals prioritize expansion over blocking, recovery options after mistakes.
- **Standard:** balanced economy and adaptive rivals.
- **Hard:** rivals value strategic bottlenecks, contest the player's plans, and use cash more efficiently.
- **Expert:** stronger long-term planning, more aggressive negotiations, fewer hints, and tighter scenario constraints.

Difficulty must not be implemented as hidden arbitrary bonuses alone. If AI receives economic advantages, disclose them in the setup screen.

## 4. Victory and match length

A standard match ends when a player reaches **Dominion Score 100**, or the 40-turn limit is reached.

Initial score composition (tune after playtests):
- 35% net empire value (cash + business value - liabilities),
- 25% territory and city influence,
- 20% economic network efficiency,
- 15% recurring income,
- 5% achievements / scenario objectives.

A fast victory may require control of 3 of 5 national capitals or a defined combination of key cities and strategic assets. Do not require 100% of the map in every match; total conquest should be an optional long-term challenge. The score panel must explain exactly why each player is winning.

## 5. World structure

Reuse the current fictional continent, country data, cities, companies, descriptions, and coordinates where practical. Rework the role of the data: it should drive playable spaces, not function only as a reference catalogue.

### Map hierarchy
- Continent
- Countries / regions
- Cities
- Sites and businesses

Each country has a distinct but restrained identity (terrain, architecture, resource profile), 2–4 cities for the prototype, one key city, 1–3 strategic assets, one economic strength and one vulnerability.

Each city has a city influence meter, a few purchasable sites, one or more business types, a local demand modifier, and at least one strategic connection to another city.

### Ownership and city control
A city is influenced by controlling key assets, not purchased as a single button. For the prototype, control can be represented by owning 2 of 3 designated key sites. City control provides a modest income bonus and contributes to national influence. National control requires influence across several cities and should be introduced after the first playable build.

## 6. Business classes

Use a small, intuitive roster at first:
- **Shop / Retail:** cheap entry, steady low income.
- **Factory:** medium cost, strong income, depends on supply.
- **Farm / Resource site:** produces a resource used by factories.
- **Rail hub / Road depot:** improves connections and business efficiency.
- **Port / Trade terminal:** expensive strategic bottleneck, boosts trade.
- **Technology firm:** higher upside, more event-sensitive.
- **Bank / Finance house:** provides negotiation or financing options later.

Every business card must answer in plain language: what it costs, how much it earns per turn, what it needs, what it unlocks, and why it is strategically useful. Do not show jargon as the primary label. Say "Earns +120 each turn" before "yield" or "ROI".

## 7. Economic model — prototype

Use a deterministic, transparent economy first. Add randomness only through clearly explained events.

Each business has purchase cost, base income, upkeep, category, city ID, owner ID, level, optional input requirements, optional output/resource, and strategic tags.

Per-turn net income:
netIncome = baseIncome × levelMultiplier × demandMultiplier × networkMultiplier − upkeep

Initial tuning ranges (illustrative; balance in playtests):
- Small shop: cost 250, net +35/turn.
- Farm: cost 400, net +45/turn and resource output.
- Factory: cost 700, net +95/turn with supply; +45 without.
- Rail hub: cost 600, modest direct income, improves connected assets.
- Port: cost 1,200, net +130/turn and trade-route bonus.

The values are placeholders, not final balance. Every purchase preview should show payback in turns as a simple estimate, plus strategic effects and risks.

### Supply chains
The first build supports at most one simple chain:
Farm -> Factory -> Port / Trade Terminal.
Each connected link provides a visible bonus. Avoid graph-heavy logistics UI in the tutorial; show a simple line on the map and a plain-language benefit.

### Events
Use 6–8 events in the first build:
- Construction boom: retail income rises in one city.
- Supply shortage: factories without a resource link earn less.
- New trade corridor: linked ports and rail hubs earn more.
- Consumer slump: retail income falls temporarily.
- Technology breakthrough: technology businesses gain a temporary boost.
- Strike: one industrial city loses income until resolved.
- Infrastructure grant: a public investment opportunity appears.
- Rival acquisition: AI completes a visible expansion objective.

Every event needs a clear "what changed / who benefits / what can I do" explanation.

## 8. Rival AI

The first version should use four distinct AI archetypes:
- **The Builder:** prefers stable income and linked businesses.
- **The Expansionist:** aggressively takes valuable cities and bottlenecks.
- **The Industrialist:** specializes in resource chains and factories.
- **The Opportunist:** keeps cash available and seeks undervalued assets and trades.

Each AI turn:
1. Evaluate affordable assets.
2. Score each candidate using income, payback, strategic value, rival threat, synergy, and cash reserve.
3. Choose a legal action.
4. Update its goal if blocked or if an event changes the market.
5. Log a concise, human-readable explanation in the activity feed.

AI should not know future random events. Use a seeded random generator for reproducible test matches. Avoid arbitrary cheating. The UI should show personality through decisions and short lines, not long dialogue.

## 9. Negotiation and rivalry

Negotiation is a later milestone, but the data model should not prevent it. Planned offers: buy a business from a rival, trade one business for another plus cash, temporary supply or route agreement, cease-fire / shared infrastructure agreement.

AI acceptance uses its own valuation and strategic intent, not a single fixed percentage. The first prototype can omit negotiation if the main purchase/upgrade/territory loop is not yet fun.

## 10. First-time user experience

The user should understand the game in under 30 seconds.

Opening screen:
- "Build your empire. Outsmart four rivals. Control the continent."
- New Game
- Continue
- How to Play (short, visual)
- Settings

New game setup is limited to difficulty, starting leader/region, and match length / victory target. Advanced options stay behind "More settings".

Tutorial:
1. Highlight one unowned shop: "Buy this business. It earns money every turn."
2. Show the income tick and explain that rivals act too.
3. Highlight a second strategic asset and show the objective: "Control 2 of 3 key sites to influence this city."
4. Teach End Turn and the match leaderboard.
5. Let the player make the next decision without a modal blocking the map.

Persistent **Next Move** panel:
- One recommended action.
- Why it helps.
- Estimated cost and effect.
- One button to focus the relevant map object.
It should never be a wall of tasks.

## 11. UI / information architecture

Reduce the many current sections to four primary destinations:
1. **World** — main map and all context-sensitive actions.
2. **Empire** — owned businesses, income, upgrades, supply links.
3. **Rivals** — opponent profiles, rankings, current threats, offers (later).
4. **Objectives** — victory conditions, city control, achievements.

A compact top bar shows cash, net income per turn, turn number, and current leader. The End Turn button is always visible. News/events appear in a short activity feed, not a separate mandatory section.

Context-first interaction:
- clicking a city opens its city panel,
- clicking a business opens its action panel,
- clicking a rival opens their dossier,
- clicking an event explains its impact and highlights affected locations.

Do not use nested menus for common actions. Keep advanced financial details behind optional disclosure. Replace empty dashboards with actionable map states.

## 12. Visual direction

### Target aesthetic
**Premium isometric economic strategy game**: believable miniature architecture, carefully layered terrain, strong readable silhouettes, elegant lighting, restrained color, crisp typography, and a sense of a physical strategic world.

It must not look like a children's hand-drawn map, flat cartoon geography, a generic finance dashboard, a wall of glassmorphism cards, a collection of unrelated stock images, or a neon sci-fi admin panel.

### Map rendering
Do not attempt to make a serious map from one huge hand-authored SVG path or a pile of emoji. Build a layered map from structured assets:
- base terrain / coast / rivers,
- country and city boundaries,
- roads and rail lines,
- terrain details,
- city clusters and landmarks,
- business buildings,
- ownership overlays,
- selection and hover states.

Use SVG/canvas/WebGL according to current app constraints, but separate map geometry from screen-space UI labels. All labels and markers must stay aligned during pan, zoom, resize, and hover. The world coordinate transform must be shared by buildings, roads, and markers.

For the first prototype, prefer a carefully composed high-quality 2.5D/isometric board over a technically ambitious but visually weak globe or low-detail atlas. Use a limited region and polished assets before expanding the whole continent.

### Art pipeline
- Create a consistent asset kit: 6 terrain tiles, 8 business building silhouettes, 4 landmarks, 4 rival portraits, 6 event illustrations, map pins, selection rings, and ownership materials.
- Define one camera angle, light direction, shadow softness, outline treatment, material scale, and palette.
- Use original or properly licensed assets. Do not replace existing issuer/company logos with generated lookalikes.
- AI-generated concept art can guide direction but must not be used as a fake interactive map; gameplay map elements must remain separately selectable and responsive.
- Test at 1920x1080, 1600x900, 1440x900, 1366x768, 1280x720, and mobile.

### Palette and typography
Graphite / warm off-white / deep forest green / muted teal / warm brass, with restrained red for danger. Country ownership colors must be distinguishable and accessible. Use a display face only for key titles; body and controls must prioritize legibility. Avoid oversized numbers without meaning.

### Motion and feedback
- Purchase: short placement animation + cash delta.
- Income: subtle income tick and clear total.
- Rival move: map focus and activity feed entry.
- Territory control: border transition and concise banner.
- Error: explain how to recover.
Animations should be brief and respect reduced-motion settings.

## 13. Accessibility and usability

All important actions are labeled with words, not icons alone. Color is never the only indication of ownership. Tooltips explain unfamiliar concepts. Map zoom and pan have visible controls and keyboard alternatives where practical. Keep contrast strong and text readable. Do not make essential information hover-only. Provide a compact mode for smaller screens.

## 14. Technical constraints and preservation

Preserve and adapt existing architecture rather than rewrite blindly:
- React + TypeScript + Vite.
- Existing authentication / registration.
- Existing localStorage saves and ratings.
- Existing fictional world data where useful.
- Existing company and country dossiers as secondary detail, not the core loop.

Separate game state and rules from rendering. Proposed modules:
- src/game/match.ts: match lifecycle, turn and victory state.
- src/game/businesses.ts: business data, buying, upgrades and income.
- src/game/ai.ts: rival decision-making.
- src/game/territories.ts: city and country influence.
- src/game/events.ts: event resolution.
- src/game/scoring.ts: standings and victory score.
- src/game/save.ts: versioned save/load and migration.
- src/components/game/WorldMap.tsx: interactive map presentation.
- src/components/game/ActionPanel.tsx: context actions.
- src/components/game/MatchHud.tsx: compact turn HUD.
- src/components/game/RivalStrip.tsx: rival status.
- src/components/game/NextMove.tsx: single recommended move.

These are proposed boundaries; inspect actual code before moving files. Avoid a monolithic App.tsx rewrite.

### Save migration
Use a versioned save schema. Do not silently overwrite existing saves. Existing career/investment mode data should be retained or backed up; the new match mode should have its own save namespace until migration is explicitly tested.

## 15. Milestones

### M0 — Design and visual target
Confirm game pillars and core loop, define map art direction and asset standards, define core entities and match state, and produce a visual prototype target before mass implementation.

### M1 — Playable graybox
One polished small region, 2–3 cities, 3 business types, one player and 3 AI rivals, buy/earn/upgrade/end turn, one simple supply chain, city influence, clear win condition, restart and save/load.

### M2 — Art-quality vertical slice
Production-ready terrain and buildings for the small region, consistent lighting and shadows, typography, map labels, hover/selection, rival moves visible on map, tutorial, compact HUD, responsive layout and basic accessibility.

### M3 — Content and balance
Expand to current countries and businesses. Add 4 AI archetypes, 6–8 events, score breakdown, difficulty tuning, more objectives and replay modifiers.

### M4 — Deeper competition
Negotiation, trade agreements, advanced supply networks, optional challenge scenarios and longer campaigns. Online multiplayer only after single-player matches are consistently fun.

## 16. Definition of done for the first public prototype

A new player can start a match, understand the first purchase without external instructions, make meaningful decisions, see rivals compete, and reach a clear result in one session. The map looks intentional and cohesive at common desktop resolutions; labels never drift; no critical UI is clipped; existing login and saves are not broken; the build passes type-check and production build.
