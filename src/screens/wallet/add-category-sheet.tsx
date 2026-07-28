import { useState } from 'react'
import { BottomSheet, Button, Input } from '../../components/ui'
import { useCategoriesStore } from '../../store'
import type { Category } from '../../services'

/** Reusable "add category" bottom sheet — used by the Budgets and Categories tabs. */
export function AddCategorySheet({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated?: (category: Category) => void
}) {
  const add = useCategoriesStore((s) => s.add)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')

  const submit = async () => {
    if (!name.trim()) return
    const category = await add(name.trim(), emoji.trim() || null)
    setName('')
    setEmoji('')
    onClose()
    onCreated?.(category)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New category">
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="w-16 shrink-0">
            <Input label="Icon" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏷️" className="text-center" />
          </div>
          <div className="flex-1">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Subscriptions" />
          </div>
        </div>
        <Button variant="primary" fullWidth onClick={submit} disabled={!name.trim()}>
          Add category
        </Button>
      </div>
    </BottomSheet>
  )
}
