import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type ToastProps = {
  message: string
  isOpen: boolean
  onDismiss?: () => void
}

/** Lightweight, non-blocking confirmation (spec §4) — e.g. "Withdrawn." */
export function Toast({ message, isOpen, onDismiss }: ToastProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="status"
          className="absolute inset-x-5 bottom-5 z-50 flex items-center justify-between gap-3 rounded-field bg-navy px-4 py-3 text-body-sm-bold text-white shadow-card"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          <span>{message}</span>
          {onDismiss && (
            <button onClick={onDismiss} className="text-label-bold text-lavender-40" aria-label="Dismiss">
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
