import { create } from 'zustand'
import {
  budgets as api,
  type BudgetPatch,
  type BudgetStatus,
  type ID,
  type NewBudget,
  type WeekStart,
} from '../services'

const weekStartsOn = (weekStart: WeekStart): 0 | 1 => (weekStart === 'sun' ? 0 : 1)

interface BudgetsState {
  statuses: BudgetStatus[]
  loading: boolean
  load: (weekStart?: WeekStart) => Promise<void>
  create: (input: NewBudget) => Promise<void>
  update: (id: ID, patch: BudgetPatch) => Promise<void>
  remove: (id: ID) => Promise<void>
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  statuses: [],
  loading: false,
  load: async (weekStart = 'mon') => {
    set({ loading: true })
    set({ statuses: await api.listBudgetStatuses(weekStartsOn(weekStart)), loading: false })
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
