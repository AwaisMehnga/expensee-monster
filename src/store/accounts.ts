import { create } from 'zustand'
import {
  accounts as api,
  type AccountBalance,
  type AccountPatch,
  type ID,
  type NewAccount,
  type Transfer,
} from '../services'

interface AccountsState {
  balances: AccountBalance[]
  total: number
  transfers: Transfer[]
  loading: boolean
  load: () => Promise<void>
  addAccount: (input: NewAccount) => Promise<void>
  updateAccount: (id: ID, patch: AccountPatch) => Promise<void>
  removeAccount: (id: ID) => Promise<void>
  transfer: (fromId: ID, toId: ID, amountCents: number, note?: string | null) => Promise<void>
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  balances: [],
  total: 0,
  transfers: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const [balances, total, transfers] = await Promise.all([
        api.listBalances(),
        api.totalBalance(),
        api.listTransfers(),
      ])
      set({ balances, total, transfers })
    } finally {
      set({ loading: false })
    }
  },
  addAccount: async (input) => {
    await api.createAccount(input)
    await get().load()
  },
  updateAccount: async (id, patch) => {
    await api.updateAccount(id, patch)
    await get().load()
  },
  removeAccount: async (id) => {
    await api.deleteAccount(id)
    await get().load()
  },
  transfer: async (fromId, toId, amountCents, note = null) => {
    await api.transfer(fromId, toId, amountCents, note)
    await get().load()
  },
}))
