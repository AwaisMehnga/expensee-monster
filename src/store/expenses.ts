import { create } from 'zustand'
import {
  analytics as analyticsApi,
  expenses as api,
  type CategoryTotal,
  type Expense,
  type ExpenseFilter,
  type ExpensePatch,
  type ID,
  type NewExpense,
  type TrendPoint,
} from '../services'

interface ExpensesState {
  items: Expense[]
  filter: ExpenseFilter
  total: number
  byCategory: CategoryTotal[]
  trend: TrendPoint[]
  loading: boolean
  load: () => Promise<void>
  setFilter: (patch: Partial<ExpenseFilter>) => void
  resetFilter: () => void
  add: (input: NewExpense) => Promise<Expense>
  update: (id: ID, patch: ExpensePatch) => Promise<void>
  remove: (id: ID) => Promise<void>
  markUnnecessary: (id: ID, unnecessary: boolean, reason?: string | null) => Promise<void>
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  items: [],
  filter: {},
  total: 0,
  byCategory: [],
  trend: [],
  loading: false,
  load: async () => {
    const { filter } = get()
    set({ loading: true })
    const [items, total, byCategory, trend] = await Promise.all([
      api.listExpenses(filter),
      analyticsApi.totalSpent(filter),
      analyticsApi.spendByCategory(filter),
      analyticsApi.trend('month', filter),
    ])
    set({ items, total, byCategory, trend, loading: false })
  },
  setFilter: (patch) => {
    set((state) => ({ filter: { ...state.filter, ...patch } }))
    void get().load()
  },
  resetFilter: () => {
    set({ filter: {} })
    void get().load()
  },
  add: async (input) => {
    const expense = await api.createExpense(input)
    await get().load()
    return expense
  },
  update: async (id, patch) => {
    await api.updateExpense(id, patch)
    await get().load()
  },
  remove: async (id) => {
    await api.deleteExpense(id)
    await get().load()
  },
  markUnnecessary: async (id, unnecessary, reason = null) => {
    await api.markUnnecessary(id, unnecessary, reason)
    await get().load()
  },
}))
