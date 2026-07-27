import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface AccordionItemProps {
  id: string
  title: React.ReactNode
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
}) => {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-4 text-left font-semibold text-sm transition-colors ${
          isOpen ? 'text-primary-600' : 'text-text-primary hover:text-text-primary'
        }`}
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-primary-600' : 'text-text-muted'
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-xs text-text-secondary leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

export interface AccordionProps {
  items: Array<{ id: string; title: React.ReactNode; content: React.ReactNode }>
  allowMultiple?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [openIds, setOpenIds] = useState<string[]>([])

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]))
    }
  }

  return (
    <div className="w-full divide-y divide-border-default border-y border-border-default">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
