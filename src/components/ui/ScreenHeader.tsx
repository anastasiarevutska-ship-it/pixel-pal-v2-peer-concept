function ChevronLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-navy"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

/**
 * Back-button-then-title header for drill-down sub-pages — the pattern
 * shared by every screenshotted sub-page off a tab screen (e.g. Medication
 * Inventory, Prescriptions, Past Orders; the Community group screens):
 * a small `rounded-icon` lavender-40 back button, then a large light-weight
 * screen title, then plain content below (white `shadow-card` cards on the
 * base background — no glow, no `TabBar`, since none of those source
 * screens carries one).
 *
 * MATCHED FROM SCREENSHOTS, not a programmatic Figma pull — the connector
 * wasn't authorized in this session. The back button's visual box and the
 * `screen-title` token's exact size/weight are both estimates; correct them
 * if the connector is ever connected. The 44px touch target on the back
 * button is not an estimate — every interactive target elsewhere in this
 * project is verified at 44px, and this one is built to the same rule
 * regardless of how big its visible box is drawn.
 */
export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-icon bg-lavender-40">
          <ChevronLeft />
        </span>
      </button>
      <h1 className="text-screen-title text-navy">{title}</h1>
    </div>
  )
}
