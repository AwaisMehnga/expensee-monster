# Progress — Expensee Monster

## Done

- **Design & docs** — `plan.md`, `design.md`, `guide.md`, `monster-prompts.md` (image prompts for the mascot states).
- **Theme** — violet monochromatic, hue-driven tokens in `src/index.css`. Mibu-minimal flat style (no glass/shadows).
- **UI kit** — `src/components/ui/*` restyled flat + violet: Button, Card, Badge, Input/Select/Switch/Slider, Tabs, SegmentedControl, SelectMenu (custom dropdown), DatePicker, Modal, Toast, Accordion, Alert, EmptyState, Divider, ProgressBar, SearchBar, Screen/ScreenHeader/Eyebrow, Monster (image-based), FloatingNav (icon-only, page transitions).
- **Screens** — Onboarding (first-run, gated on `onboarded`), Log, Expenses, Wallet, Insights, Settings — **wired to real data** (no mock), with manual add-forms (expense/account/budget), filters, transfers, mark-unnecessary, live settings.
- **Database** — SQLite (`@sqlite.org/sqlite-wasm`) in a **Web Worker** with the OPFS SAHPool VFS (persists on every browser, off the main thread); main thread talks to it via an async `postMessage` proxy. Migrations via `user_version`. Tables: categories, accounts, expenses, transfers, budgets, settings (key-value). Money = integer cents.
- **Stores** (`src/store/`) — Zustand stores over the services: `useSettingsStore`, `useExpensesStore`, `useAccountsStore`, `useBudgetsStore`, `useCategoriesStore`. Screens load on mount; settings loaded app-wide in Layout.

## APIs (`src/services/`)

Namespaced barrel: `expenses.*`, `accounts.*`, `budgets.*`, `categories.*`, `analytics.*` + `initDb()`.

**expenses** — `listExpenses(filter)` · `getExpense` · `createExpense` · `updateExpense` · `deleteExpense` · `markUnnecessary`
**accounts** — `listAccounts` · `getAccount` · `createAccount` · `updateAccount` · `deleteAccount` · `getBalance` · `listBalances` · `totalBalance` · `transfer` · `listTransfers`
**categories** — `listCategories` · `getCategory` · `createCategory` · `getOrCreateCategory` · `deleteCategory`
**budgets** — `listBudgets` · `getBudget` · `createBudget` · `updateBudget` · `deleteBudget` · `getBudgetStatus` · `listBudgetStatuses`
**analytics** — `totalSpent` · `unnecessaryTotal` · `spendByCategory` · `topPlaces` · `trend(day|month)`
**settings** — `getSettings` · `saveSettings` · `getSetting` · `setSetting` · `isOnboarded` · `setOnboarded`

_Filters: date range, category, account, place, unnecessary, search. Balances & budget pacing are computed, not stored._

## Next

- Voice agent: local Whisper + LLM provider adapters + AI tool registry over these services.
- PWA (installable, offline) + monster images in `public/monsters/`.
