import React from 'react'

export type MonsterState = 'idle' | 'listening' | 'thinking' | 'asking' | 'happy' | 'concerned'

// state → image in /public/monsters. Generate these with the prompts in
// monster-prompts.md, then drop the PNGs in — no code change needed.
export const MONSTER_IMAGES: Record<MonsterState, string> = {
  idle: '/monsters/idle.png',
  listening: '/monsters/listening.png',
  thinking: '/monsters/thinking.png',
  asking: '/monsters/asking.png',
  happy: '/monsters/happy.png',
  concerned: '/monsters/concerned.png',
}

export interface MonsterMascotProps {
  state?: MonsterState
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
}

const sizeClasses: Record<NonNullable<MonsterMascotProps['size']>, string> = {
  sm: 'w-16 h-16',
  md: 'w-28 h-28',
  lg: 'w-40 h-40',
  xl: 'w-56 h-56',
}

export const MonsterMascot: React.FC<MonsterMascotProps> = ({
  state = 'idle',
  message,
  size = 'md',
  className = '',
  onClick,
}) => {
  return (
    <div className={`relative flex select-none flex-col items-center ${className}`}>
      {message && (
        <div className="relative mb-3 max-w-xs animate-fade-in rounded-2xl border border-border-default bg-surface-raised px-4 py-2.5 text-center text-xs font-semibold text-text-primary shadow-sm">
          {message}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border-default bg-surface-raised" />
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={`Monster (${state})`}
        className={`relative ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <img
          src={MONSTER_IMAGES[state]}
          alt={`Expensee Monster feeling ${state}`}
          className="h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(124,92,252,0.28)]"
          draggable={false}
        />
      </button>
    </div>
  )
}
