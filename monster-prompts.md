# Expensee Monster — Image Generation Prompts

Prompts to generate the mascot in a **consistent** style across every state and
pose. Generate each, export as **transparent PNG**, and drop into
`public/monsters/` using the filenames below.

---

## ⭐ 0. LOCKED BASE STYLE — paste this into EVERY prompt

Keeping the same character across images is the whole game. Prepend this block
(or set it as a style reference / seed) for every generation:

> **Character:** "Expensee", a cute, friendly, round expense-tracker monster.
> Soft rounded blob body, small stubby arms and legs, two little rounded horns
> on top, big expressive glossy eyes, tiny rosy cheeks, simple smile. Chubby,
> huggable, non-scary, appealing to adults using a finance app.
>
> **Style:** modern flat vector illustration with soft cel shading, smooth clean
> edges, subtle soft inner shadow, gentle rim light. Playful but premium — think
> polished mobile-app mascot, not childish clip-art. No outline sketchiness, no
> photorealism, no 3D clay render.
>
> **Color:** violet / grape palette. Body primary **#7C5CFC**, lighter belly
> **#B8A5FF**, horns/details **#6A45F0**, deep accents **#4A2CAF**, white eyes,
> soft pink cheeks **#F4A5C0**. Cohesive monochromatic violet scheme, only tiny
> non-violet accents allowed (e.g. gold coin).
>
> **Composition:** single centered character, facing viewer, full body, generous
> even padding around it, nothing cropped. **Transparent background.** Square
> 1:1. Consistent character design, proportions, and colors across all images.

**Global technical spec for exports**
- Format: PNG with real transparency (alpha), no checkerboard, no white box.
- Canvas: square, **1024×1024** (downscaled in-app). Also export **512×512** if you want lighter assets.
- Character centered, ~12–15% padding on all sides so it never touches edges.
- Same light direction (top-left) and same eye style in every image.

---

## 🎭 1. REQUIRED — the 6 app states

These map 1:1 to `MonsterState` in `src/components/ui/monster.tsx`. Filenames are exact.

### `idle.png` — resting / neutral
> [BASE STYLE] Expensee standing relaxed and content, calm neutral smile, eyes
> open looking gently forward, arms resting at sides. Approachable and calm.
> Default resting pose.

### `listening.png` — actively listening (mic on)
> [BASE STYLE] Expensee leaning slightly forward, alert and attentive, big bright
> eager eyes, one little hand cupped near its ear or a small headset, tiny sound
> waves near its head. Excited to hear you. Energetic, ready.

### `thinking.png` — processing / analyzing
> [BASE STYLE] Expensee looking upward thoughtfully, one stubby hand on its chin,
> a small "…" thought bubble or a couple of tiny gears above its head. Curious,
> focused, mid-thought.

### `asking.png` — needs a clarification (asks you back)
> [BASE STYLE] Expensee with a curious tilted head, one little hand raised as if
> politely asking a question, a small "?" symbol floating beside its head, one
> eyebrow raised, gentle inquisitive smile. Friendly, not confused-scared.

### `happy.png` — success / expense saved / celebrating
> [BASE STYLE] Expensee cheering with both little arms raised, big joyful smile,
> happy closed "^ ^" curved eyes, tiny sparkles or confetti around it, maybe
> holding a small gold coin. Delighted, celebratory.

### `concerned.png` — over budget / warning
> [BASE STYLE] Expensee looking worried but still cute, slightly sweat-drop on
> its brow, worried tilted eyebrows, small nervous smile, little hands together.
> Gently alarmed about overspending — sympathetic, never grim or angry.

---

## ➕ 2. RECOMMENDED — extra poses the app can use

Optional but useful. Suggested filenames in `public/monsters/`.

### `sleeping.png` — empty state / no data yet
> [BASE STYLE] Expensee curled up cozy and asleep, eyes closed as happy curves,
> a small "Z Z Z" above its head, peaceful smile. For empty screens ("no
> expenses yet").

### `waving.png` — onboarding / welcome
> [BASE STYLE] Expensee waving hello with one raised hand, warm welcoming smile,
> bright friendly eyes, slight friendly lean. For first-run / onboarding.

### `coin.png` — savings / money-positive
> [BASE STYLE] Expensee happily hugging or balancing a single shiny gold coin
> (coin may show a tiny "$" or star), proud content smile. The only non-violet
> accent is the gold coin. For savings / under-budget wins.

### `money-rain.png` — budget win / celebration hero
> [BASE STYLE] Expensee arms up joyfully with a few gold coins gently falling
> around it, big grin, sparkles. Bigger celebration than happy.png. For "you
> saved!" moments.

### `shocked.png` — big/unusual expense detected
> [BASE STYLE] Expensee wide-eyed and surprised, small "!" above head, mouth a
> small round "o", little hands up. Surprised but cute — for flagged unusual spend.

### `detective.png` — Insights / analysis screen hero
> [BASE STYLE] Expensee as a cute detective with a tiny magnifying glass and a
> small violet deerstalker hat, curious focused look. For the AI Insights / money
> coach screen.

### `error.png` — something went wrong
> [BASE STYLE] Expensee looking apologetic with a small sheepish smile, one hand
> scratching its head, tiny sweat drop. Friendly "oops" — for error states.

---

## 🎨 3. BRANDING — logo / icon / favicon

### `mascot-hero.png` — large marketing / splash
> [BASE STYLE] Expensee in a confident hero pose, full body, big warm smile,
> subtle sparkles. Extra crisp, high detail. For splash / hero.

### App icon (`icon-512.png`, `icon-192.png` for PWA manifest)
> [BASE STYLE] Just Expensee's head-and-shoulders, centered, on a **solid violet
> #7C5CFC rounded-square background** (NOT transparent for the app icon), simple
> and bold so it reads at small sizes. Export 512×512 and 192×192. This is the
> installable PWA icon.

### `favicon` (from the app icon)
> Use the app-icon head render, exported to 48×48 and 32×32 PNG / ICO. Keep it
> extremely simple — just the face on the violet square.

---

## 🧩 4. OPTIONAL — category / accent glyphs

If you want on-brand category markers instead of emoji (design.md allows either).
Keep these tiny, simple, single-object, same violet palette, transparent PNG.

- `cat-food.png` — a cute violet food icon (coffee cup / burger) in the mascot's flat style
- `cat-transport.png` — a little violet car / bus
- `cat-shopping.png` — a violet shopping bag
- `cat-bills.png` — a violet receipt / invoice
- `cat-fun.png` — a violet game controller / balloon

> [BASE STYLE minus the character] Single small object, flat vector, soft cel
> shading, violet grape palette (#7C5CFC / #B8A5FF), centered, transparent
> background, square. Matches the Expensee mascot's illustration style.

---

## ✅ Checklist before importing

- [ ] All 6 required files exist: `idle · listening · thinking · asking · happy · concerned` `.png`
- [ ] Transparent background (except the app icon, which is solid violet)
- [ ] Same character, proportions, eyes, and palette across every image
- [ ] Square, centered, padded, 1024×1024 (or 512×512)
- [ ] Dropped into `public/monsters/` with the exact filenames above
