import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, Eyebrow, Input, LoadingSpinner } from '../../components/ui'
import { useCategoriesStore } from '../../store'
import type { Category } from '../../services'

export default function CategoriesTab() {
  const categories = useCategoriesStore((s) => s.items)
  const loading = useCategoriesStore((s) => s.loading)
  const load = useCategoriesStore((s) => s.load)
  const add = useCategoriesStore((s) => s.add)
  const remove = useCategoriesStore((s) => s.remove)

  useEffect(() => {
    void load()
  }, [load])

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const submit = async () => {
    if (!name.trim()) return
    await add(name.trim(), emoji.trim() || null)
    setName('')
    setEmoji('')
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await remove(pendingDelete.id)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Eyebrow>Categories</Eyebrow>
      <p className="mt-2 text-sm text-text-muted">Used to tag expenses and set per-category budgets.</p>

      <div className="pt-4">
        {loading && categories.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <div className="divide-y divide-border-default">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-lg">
                    {c.icon ?? '🏷️'}
                  </span>
                  <p className="truncate font-semibold text-text-primary">{c.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(c)}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-primary-50 hover:text-status-danger"
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        message="Expenses in this category won't be deleted — they'll become Uncategorized. Any budget for this category will be removed."
        confirmText="Delete"
        cancelText="Keep"
        isDanger
        isLoading={deleting}
      />

      {/* Inline add — no popup */}
      <div className="mt-4 flex items-end gap-2 rounded-2xl border border-border-default p-3">
        <div className="w-14 shrink-0">
          <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏷️" className="text-center" />
        </div>
        <div className="flex-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" />
        </div>
        <Button variant="primary" onClick={submit} disabled={!name.trim()} leftIcon={<Plus className="h-4 w-4" />}>
          Add
        </Button>
      </div>
    </div>
  )
}
