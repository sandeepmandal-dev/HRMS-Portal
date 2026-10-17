import { motion } from 'framer-motion'
import { cn } from '../ui/cn'

/** Underline-style tab switcher with a sliding active indicator. */
export default function SectionTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-ink' : 'text-slate-500 hover:text-ink'
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
