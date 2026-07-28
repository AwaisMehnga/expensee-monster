import { create } from 'zustand'
import {
  budgets as api,
  type Budget,
  type BudgetPatch,
  type BudgetStatus,
  type ID,
  type NewBudget,
  type WeekStart,
} from '../services'

const weekStartsOn = (weekStart: WeekStart): 0 | 1 => (weekStart === 'sun' ? 0 : 1)

interface BudgetsState {
  budgets: Budget[]
  statuses: BudgetStatus[]
  loading: boolean
  load: (weekStart?: WeekStart) => Promise<void>
  create: (input: NewBudget) => Promise<void>
  update: (id: ID, patch: BudgetPatch) => Promise<void>
  remove: (id: ID) => Promise<void>
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
  statuses: [],
  loading: false,
  load: async (weekStart = 'mon') => {
    set({ loading: true })
    try {
      const [budgets, statuses] = await Promise.all([
        api.listBudgets(),
        api.listBudgetStatuses(weekStartsOn(weekStart)),
      ])
      set({ budgets, statuses })
    } finally {
      set({ loading: false })
    }
  },
  create: async (input) => {
    await api.createBudget(input)
    await get().load()
  },
  update: async (id, patch) => {
    await api.updateBudget(id, patch)
    await get().load()
  },
  remove: async (id) => {
    await api.deleteBudget(id)
    await get().load()
  },
}))
