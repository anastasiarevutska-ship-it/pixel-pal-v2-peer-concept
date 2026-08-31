import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type SheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Bottom sheet (spec §4). Slides up from the bottom; fades instead when
 * `prefers-reduced-motion` is set (spec §8). Uses `absolute inset-0` (see
 * PhoneFrame) rather than `fixed`, so it confines to the device screen it's
 * opened inside.
 */
export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-navy/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 max-h-[85%] w-full overflow-y-auto rounded-t-card bg-white p-5 shadow-card"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-navy-20" aria-hidden="true" />
            {title && <h2 className="mb-3 text-h3">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
