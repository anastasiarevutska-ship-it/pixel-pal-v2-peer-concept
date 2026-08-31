import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'

/** Placeholder for /bo/* — Phase 3 (spec §2, §6.6) isn't built yet. Desktop-
 * shaped, not PhoneFrame-wrapped: Back Office is a web console. */
export default function Coordinator() {
  return (
    <div className="min-h-screen bg-gray20 p-10">
      <Link to="/" className="text-label-bold text-navy-60 hover:text-navy">
        ← Launcher
      </Link>
      <div className="mx-auto mt-10 max-w-2xl">
        <EmptyState
          title="Program cockpit — coming next"
          description="Phase 3: health dashboard, exception queue, and the Pal roster (spec §6.6)."
        />
      </div>
    </div>
  )
}
