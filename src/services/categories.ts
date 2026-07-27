import { all, get, insert, run } from '../db/client'
import type { Category, ID } from '../db/types'
import { nowISO } from '../lib/dates'

export function listCategories(): Promise<Category[]> {
  return all<Category>('SELECT * FROM categories ORDER BY name')
}

export function getCategory(id: ID): Promise<Category | undefined> {
  return get<Category>('SELECT * FROM categories WHERE id = ?', [id])
}

export async function createCategory(name: string, icon: string | null = null): Promise<Category> {
  const id = await insert('INSERT INTO categories (name, icon, created_at) VALUES (?, ?, ?)', [
    name,
    icon,
    nowISO(),
  ])
  return (await getCategory(id))!
}

/** Find a category by name (case-insensitive) or create it. Used by AI extraction. */
export async function getOrCreateCategory(name: string, icon: string | null = null): Promise<Category> {
  const existing = await get<Category>('SELECT * FROM categories WHERE name = ? COLLATE NOCASE', [name])
  return existing ?? createCategory(name, icon)
}

export function deleteCategory(id: ID): Promise<void> {
  return run('DELETE FROM categories WHERE id = ?', [id])
}
