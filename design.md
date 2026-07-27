# Design — Expensee Monster

A **fun, friendly, colorful** expense tracker built around a cute violet
**monster** mascot. Clean and uncluttered, but never sterile — playful shapes,
generous rounding, a confident single accent color, and real personality from
the monster imagery. Think polished, delightful mobile-app, not a minimalist
text document.

The whole palette is driven by `src/index.css` tokens. **Never hardcode color.**

---

## 0. Color — one vivid identity

- All color via tokens only: `--primary-*` (violet "grape"), `surface-*`, `text-*`, `border-*`, `status-*`.
- **Monochromatic + confident.** The violet `--primary` hue is the brand — use it generously and with intent: primary buttons, active states, key numbers, highlights, monster glow, progress. It's the identity, not a rare accent.
- **Ink** = `text-primary` (a dark violet-tinted near-black), for body text and labels.
- Keep it a **single hue family** — violet tints/shades do the work; avoid introducing unrelated colors. Status colors (success/warn/danger) are the only exceptions and stay muted.
- Re-theming = changing `--primary-hue` in Settings. No inline hex, no one-off Tailwind color classes (`bg-blue-500`), no per-component palettes.

---

## 1. Visual language — mibu-minimal, in violet

The layout language is **minimalist and airy** (the "mibu" vibe): lots of white
space, one big number per screen, thin hairline dividers instead of heavy boxes.
Violet is the **punctuation**, not the wallpaper — most of the UI is ink-on-white,
and the accent marks what matters (the key figure, the active state, the CTA, the
chart line, the monster).

**Flat & airy — the core of the vibe.**
- **No glassmorphism** (`.glass`/`backdrop-blur`) and **essentially no shadows** in content. Separation comes from **whitespace first, hairline borders second**. The only permitted shadows are the **monster's soft violet glow** and the **floating `+` button**.
- **Prefer air, then dividers, then borders, then boxes** — in that order. Don't wrap everything in cards. A list is `divide-y divide-border-default` rows on the page, not a stack of bordered cards.
- **Generous rounding.** `rounded-2xl`/`rounded-3xl` where a surface *is* used; `rounded-full` on pills, chips, avatars, mic, and the primary CTA. Nothing sharp.
- Use `surface-raised` cards **sparingly** — only to group a genuinely distinct block. Most sections are just headed content on the page background.

**Big number.** Every screen has one hero figure: `text-4xl`–`text-5xl font-extrabold tracking-tight tabular-nums`, near the top. Everything else is quieter than it.

**Color discipline.**
- Primary action / selected / active = **solid `primary` fill**, white text. Otherwise the accent shows up as: the hero number (or its sign), active nav/tab, chart stroke, progress fill, small highlights.
- Secondary = plain ink text or hairline-outlined pill. Tertiary = muted.
- Soft `primary-50` tint is the *only* fill used for calm emphasis (active pill background, subtle panel). No loud full-bleed violet blocks.
- One primary emphasis per control group; never two filled buttons competing.

**Space & rhythm.**
- Screen padding `px-4 sm:px-6`; vertical rhythm in multiples of 4 (`space-y-5`/`6` between sections — err toward *more* air).
- Section eyebrow (`text-[11px] uppercase tracking-[0.24em] text-text-muted`) + content, separated by space, not borders.

---

## 2. Typography

- Font: **Plus Jakarta Sans** (already configured). System fallback only.
- **Numerals are the hero.** Money/totals: large + heavy — `text-4xl`–`text-5xl font-extrabold tracking-tight` for the primary figure; `tabular-nums` for aligned columns.
- **Labels are calm.** Secondary/metadata: `text-xs`–`text-sm text-text-muted`.
- Section eyebrows: `text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted`.
- Playful is fine in copy/tone (the monster has personality); keep type styles restrained — heavy for numbers/headings, regular/medium elsewhere.

---

## 3. The Monster (image-based)

- The mascot is **actual generated images**, not coded/line-art. Rendered by
  `MonsterMascot` in `src/components/ui/monster.tsx`, which maps a `state` to a
  PNG in `public/monsters/`.
- States: `idle · listening · thinking · asking · happy · concerned` (plus optional extras). Generate them with `/monster-prompts.md`.
- Monster imagery gets a **soft violet glow/drop-shadow** to feel alive, but is **static — no animation** (no bounce/pulse/scale). Personality comes from the expression images, not motion. It's the emotional anchor of the app — feature it on Log, empty states, success moments, and coaching.
- Icons elsewhere: **Lucide only**, normal weight, ink or accent colored.
- Category markers: emoji **or** the optional violet category glyphs from `/monster-prompts.md` — one system per screen.

---

## 4. Component patterns

- **Big number header** — the screen's key figure large and bold up top, a small pill control beside it (`this month ▾`, search).
- **Segmented toggle** — pill group; selected = solid `primary`, rest plain. (expenses / income, all / review / recurring.)
- **Filter / tag chips** — rounded-full, hairline or `primary-50` tint; selected = solid primary.
- **Transaction row** — `[emoji/glyph] name + merchant(muted) …… amount(bold, right)`, `divide-y` separated.
- **Cards** — `surface-raised`, `rounded-3xl`, hairline border + soft shadow, real padding (`p-5`/`p-6`).
- **Progress / budgets** — rounded meters in the primary hue; over-budget shifts to `status-danger`.
- **Inputs / selects / date picker** — rounded-2xl, hairline border, clear focus ring in `primary`.

---

## 5. Navigation

- Floating bottom nav: `surface-raised`, top hairline, soft shadow; rounded.
- Line icons; **active item = accent hue** (+ optional soft `primary-50` pill), inactive muted.
- A prominent **`+` action** (solid primary, `rounded-full`, subtle glow) is the primary "log expense" trigger.
- Pages: **Log · Expenses · Wallet · Insights · Settings**.

---

## 6. Motion

- Subtle and delightful. Reuse registered animations (`fade-in`, `scale-up`, `slide-up`) for UI transitions. The **monster never animates** — it stays static.
- Quick `active:` press feedback on interactions; nothing longer than ~300ms. No parallax, no gratuitous motion.

---

## 7. Screens (structure)

- **Log** — big Monster + mic; draft-review card; budget summary + pacing line.
- **Expenses** — big total, trend line, hairline-separated transaction list; search + filter pills.
- **Wallet** — accounts (computed balances) as rows; transfer form; budgets with progress meters.
- **Insights** — spending patterns, savings suggestions, unnecessary-spend review; monster as coach.
- **Settings** — Region (country/currency), LLM provider + keys, Whisper status, **theme hue control**.

---

## 8. Build rules

- Shared state via **Zustand**. Icons via **Lucide** only.
- Use components from `src/components/ui` only; keep them small, dry, reusable.
- New shared primitives (date picker, dropdowns, segmented control, etc.) live in `src/components/ui` and follow these rules — build once, reuse.
- No mobile-shaped wrapper divs; let responsive layout + device mode handle preview.
