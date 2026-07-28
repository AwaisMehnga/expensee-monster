# Expensee Monster — Comprehensive Plan & Architecture

**Expensee Monster** is a fun, clean, modern, monochromatic **PWA** expense tracker powered by a cute AI Monster agent. Speak your expenses; the Monster agent transcribes with local Whisper, asks back for any missing details (like place or amount), lets you review and correct by voice or text, and saves to a local SQLite database. 

Separate screens provide deep analytics and an AI Money Coach to help you optimize spending and identify unnecessary expenses.

---

## 🎨 1. Monochromatic Design System (Tailwind v4)

- **Single Primary Color System**: Driven by a CSS variable `--primary-hue` (0-360) allowing dynamic theme color changing in Settings while preserving a clean monochromatic aesthetic.
- **Dynamic Scales**: Light, surface, border, and accent colors are calculated relative to `--primary-hue` using HSL/OKLCH for crisp contrast in both dark and light modes.
- **Typography & Aesthetics**: Modern rounded sans-serif font stack, glassmorphism cards, micro-animations, clean borders (`border-primary-500/20`), and subtle shadows.

---

## 📱 2. Screen Architecture (Bottom Navigation)

1. **Log (Home)**:
   - Big animated **Monster Mascot** showing state (`idle`, `listening`, `thinking`, `asking`, `happy`, `concerned`).
   - Large voice record trigger (mic button).
   - Interactive clarification dialog & review draft card (manual & voice correction).
   - **Budget Summary Bar**: This month's **total budget** (sum of the month's per-category budgets), current spent, remaining balance, and daily pacing tip from the Monster. If no budgets are set, shows a "Set a budget" prompt → Wallet.

2. **Expenses (Analytics & Filtering)**:
   - Full list of logged expenses with search and quick actions.
   - Comprehensive multi-dimensional filtering: Date range, category, location/place, expense source, and "unnecessary" flag status.
   - Analytical reports: Category breakdowns, daily trends, top spending locations.

3. **Insights (AI Money Coach)**:
   - AI-driven financial analysis on spending patterns.
   - Smart spending reduction suggestions.
   - Unnecessary expense detector: AI flags suspicious or wasteful expenses and asks the user to confirm/mark them as unnecessary.

4. **Wallet** — three tabs (`Accounts · Budgets · Categories`):
   - **Accounts**: Add/edit accounts (cash, bank, card, wallet) each with an opening balance. Current balance is **computed from the ledger** (opening + transfers in − transfers out − expenses), never stored, so it can't drift. Add-account and **Transfer money** open as **bottom-sheet overlays** (blurred backdrop).
   - **Budgets**: A **period toggle (Day · Week · Month)** + a navigator that steps by that period. Two-column **Total budget / Total spent** for the active window. Every category is listed — those with a budget show a progress meter (`spent / limit`), those without show a **"Set budget"** action. Setting/editing a budget opens a **bottom sheet** (limit for the selected period). Budgets are **per-category** (`period_type` = day/week/month, `category_id` = the category). A **"New category"** button opens the reusable **add-category bottom sheet**.
   - **Categories**: List of budget/expense categories (emoji + name); add via the same bottom sheet, delete with a confirm warning (expenses become **Uncategorized**, not deleted).
   - **Transfers**: Move money between accounts (records a `transfers` row; no expense created).

5. **Settings**:
   - **Region**: Country + currency (currency defaulted from country), locale/number formatting, week-start day (drives the weekly budget window).
   - **LLM Provider & API Keys**: Unified support for **Gemini, OpenAI, Grok, DeepSeek, Claude**. Keys stored strictly in client-side storage (`localStorage`).
   - **Local STT (Whisper)**: Model loading status, cached state indicator, and re-download options.
   - **Appearance**: Live monochromatic hue color picker (primary color selection).

---

## 🎙️ 3. Core Voice Agent Loop

```
[ Tap Mic ] -> MediaRecorder captures audio -> Local OpenAI Whisper STT -> Transcribed text
  |
  v
[ Unified LLM Agent ] -> Extracts JSON: { expenses: [{ item, amount, place, category, date }], clarifications: [] }
  |
  +--> IF clarifications exist (e.g. missing place/location):
  |       Monster asks back -> User replies via voice or text -> Merge & re-extract
  |
  +--> IF clean / complete:
          Shows interactive Review Card -> User can edit fields manually OR speak a correction ("change coffee to $5")
  |
  v
[ Confirm & Save ] -> Written to local SQLite (WASM on OPFS) -> Updates Budget & Mascot state (happy)
```

---

## 💾 4. Database Schema (SQLite / WASM on OPFS)

All monetary values are stored as **integer cents** to avoid floating point precision issues.

### Table: `expenses`
Stores individual expense records.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` |
| `item` | `TEXT` | Name of item/service (e.g., "Latte") |
| `amount_cents` | `INTEGER` | Amount in integer cents ($10.50 -> 1050) |
| `currency` | `TEXT` | Default currency code (e.g., "USD", "EUR") |
| `place` | `TEXT` | Location/merchant (e.g., "Starbucks") |
| `category_id` | `INTEGER` | `FOREIGN KEY` -> `categories(id)` |
| `account_id` | `INTEGER` | `FOREIGN KEY` -> `accounts(id)` (which account it was paid from) |
| `note` | `TEXT` | Optional user or AI notes |
| `is_unnecessary` | `INTEGER` | `0` or `1` (Flagged by AI / User) |
| `unnecessary_reason` | `TEXT` | Reason why marked unnecessary |
| `source` | `TEXT` | `'voice'` \| `'manual'` |
| `raw_transcript` | `TEXT` | Original transcribed text for audit |
| `spent_at` | `TEXT` | ISO 8601 Timestamp of expense |
| `created_at` | `TEXT` | ISO 8601 Timestamp |
| `updated_at` | `TEXT` | ISO 8601 Timestamp |

### Table: `categories`
Categories auto-created or selected during extraction.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` |
| `name` | `TEXT` | `UNIQUE` (e.g., "Food", "Transport", "Shopping") |
| `icon` | `TEXT` | Lucide icon name string |
| `color` | `TEXT` | Category theme accent color |
| `created_at` | `TEXT` | ISO 8601 Timestamp |

### Table: `budgets`
Budget rules per timeframe and category. The schema keeps `year`/`custom` and
`NULL` (overall) for flexibility, but the **Budgets UI currently creates
per-category budgets for `day` / `week` / `month`** (one budget per category per
period). Home sums the month's per-category budgets for its summary.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` |
| `amount_cents` | `INTEGER` | Budget limit in cents |
| `period_type` | `TEXT` | `'day'` \| `'week'` \| `'month'` \| `'year'` \| `'custom'` |
| `start_date` | `TEXT` | Anchor date or start of custom range |
| `end_date` | `TEXT` | End date for custom range (NULL for recurring) |
| `category_id` | `INTEGER` | `FOREIGN KEY` -> `categories(id)` (NULL = overall) |
| `created_at` | `TEXT` | ISO 8601 Timestamp |

### Table: `accounts`
Money sources. Current balance is computed from the ledger, not stored.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` |
| `name` | `TEXT` | e.g., "Cash", "Chase Debit" |
| `type` | `TEXT` | `'cash'` \| `'bank'` \| `'card'` \| `'wallet'` |
| `opening_balance_cents` | `INTEGER` | Starting balance in cents |
| `currency` | `TEXT` | Currency code |
| `icon` | `TEXT` | Lucide icon name string |
| `created_at` | `TEXT` | ISO 8601 Timestamp |

### Table: `transfers`
Money moved between accounts. Not an expense.

| Column | Type | Constraints / Description |
|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` |
| `from_account_id` | `INTEGER` | `FOREIGN KEY` -> `accounts(id)` |
| `to_account_id` | `INTEGER` | `FOREIGN KEY` -> `accounts(id)` |
| `amount_cents` | `INTEGER` | Amount moved in cents |
| `note` | `TEXT` | Optional note |
| `transferred_at` | `TEXT` | ISO 8601 Timestamp of transfer |
| `created_at` | `TEXT` | ISO 8601 Timestamp |

> **Balance formula (computed, per account):**
> `opening_balance_cents + Σ(transfers in) − Σ(transfers out) − Σ(expenses from account)`

---

## 🤖 5. Monster Mascot Expressions Engine

State-driven visual cues for user engagement:
- `idle`: Monster sleeping or looking around playfully.
- `listening`: Monster wearing headphones / attentively listening with mic pulsing.
- `thinking`: Monster with magnifying glass / gears spinning.
- `asking`: Monster raising hand / tilted head with speech bubble asking question.
- `happy`: Monster celebrating / holding coin when expense saved.
- `concerned`: Monster sweating / looking at budget overspend.

---

## 🔌 6. Provider Abstraction Layer

A single unified client-side interface `LLMProvider`:
- **OpenAI / Grok / DeepSeek**: OpenAI-compatible completion API.
- **Google Gemini**: Gemini REST API connector.
- **Anthropic Claude**: Messages API with direct browser call settings.

All settings and keys are managed cleanly via **Zustand** + `localStorage`.

---

## 🛠️ 7. AI Tool Layer (Function Calling → Services)

The Monster agent doesn't touch the database directly — it calls **tools**, and every tool maps 1:1 to a function in the **services layer** (`src/services/`). The same service functions back the UI, so voice and manual paths share one code path.

**Registry shape:** each tool = `{ name, description, parameters (JSON Schema), handler }`. Handlers are the plain TS service functions. The provider adapter translates this registry into each vendor's function-calling format (OpenAI tools / Gemini functionDeclarations / Claude tools), and translates tool-call results back.

**Agent loop:** LLM returns tool calls → executor runs the matching handlers → results fed back to the LLM → repeat until it returns a final message. All handlers run locally against SQLite; nothing leaves the device except the model prompt.

**Initial tool set:**

| Tool | Service | Purpose |
|---|---|---|
| `add_expense` | expenses | Create an expense (item, amount, place, category, account, date) |
| `update_expense` | expenses | Patch fields on an existing expense (drives voice corrections) |
| `delete_expense` | expenses | Remove an expense |
| `query_expenses` | expenses | Filtered read (date range, category, place, unnecessary) for Q&A + Insights |
| `mark_unnecessary` | expenses | Flag/unflag an expense with a reason |
| `add_account` | accounts | Create an account with opening balance |
| `transfer_money` | accounts | Move funds between accounts |
| `get_balances` | accounts | Computed balances per account |
| `set_budget` | budgets | Create/update a budget for a period (overall or category) |
| `get_budget_status` | budgets | Budget vs spent vs leftover + pacing for the active window |

Tools are added here as features land — the registry is the single place the agent's capabilities are declared.
