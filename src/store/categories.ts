import { create } from 'zustand'
import { categories as api, type Category, type ID } from '../services'

interface CategoriesState {
  items: Category[]
  loading: boolean
  load: () => Promise<void>
  add: (name: string, icon?: string | null) => Promise<Category>
  remove: (id: ID) => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    set({ items: await api.listCategories(), loading: false })
  },
  add: async (name, icon = null) => {
    const category = await api.createCategory(name, icon)
    await get().load()
    return category
  },
  remove: async (id) => {
    await api.deleteCategory(id)
    await get().load()
  },
}))
