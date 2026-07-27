import React, { createContext, useContext, useState } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

export interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue)

  const activeTab = value !== undefined ? value : selectedTab
  const setActiveTab = (id: string) => {
    setSelectedTab(id)
    if (onValueChange) onValueChange(id)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 p-1 bg-surface-overlay rounded-full border border-border-default ${className}`}>
      {children}
    </div>
  )
}

export interface TabTriggerProps {
  value: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  icon,
  className = '',
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabTrigger must be used within Tabs')

  const isActive = context.activeTab === value

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 select-none ${
        isActive
          ? 'bg-primary-500 text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-primary-50'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export interface TabContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabContent: React.FC<TabContentProps> = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabContent must be used within Tabs')

  if (context.activeTab !== value) return null

  return <div className={`mt-4 animate-fade-in ${className}`}>{children}</div>
}
