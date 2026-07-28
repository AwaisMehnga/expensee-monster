// Public data-layer API. UI and the AI tool layer both call these — one path.
export * as categories from './categories'
export * as accounts from './accounts'
export * as expenses from './expenses'
export * as budgets from './budgets'
export * as analytics from './analytics'
export * as settings from './settings'

export { initDb, tx } from '../db/client'
export type * from '../db/types'
