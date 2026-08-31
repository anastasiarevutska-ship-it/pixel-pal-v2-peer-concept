import { Link, useLocation } from 'react-router-dom'
import { useDemoStore } from '../store/useDemoStore'
import iconNavHomeActive from '../assets/home/icon-nav-home.svg'
import iconNavHomeInactive from '../assets/contact/icon-nav-home-inactive.svg'
import iconNavTreatment from '../assets/home/icon-nav-treatment.svg'
import iconNavMessagesActive from '../assets/contact/icon-nav-messages-active.svg'
import iconNavMessagesInactive from '../assets/home/icon-nav-chat.svg'
import iconNavBook from '../assets/home/icon-nav-book.svg'
import iconNavCommunity from '../assets/home/icon-nav-community.svg'

type Tab = {
  key: string
  label: string
  to?: string
  active?: boolean
  activeIcon?: string
  inactiveIcon?: string
  /** Tabs with no built screen use one fixed (always-navy) icon. */
  icon?: string
  /** Which dot to show, if any — same nav position and meaning
   * ("something to check") on both roles' Messages icon, but two colors
   * because the two underlying events aren't the same thing: `coral`
   * matches the Home/Messages header "bell" dot elsewhere and marks the
   * member's unseen outcome/still-pending signal; `yellow` is new here —
   * a Pal's conversation with a reply sitting on her side. Plain colored
   * dot, not the coral `icon-bell-dot.svg` asset — a solid circle doesn't
   * need to be an image, and this way both colors render the same way. */
  dot?: 'coral' | 'yellow'
}

// Role-aware: a Pal's Home/Messages are her own dashboard and inbox
// (`/pal/dashboard`, `/pal/messages`), not the Requester's `/home`/`/m`.
// Exact-match rather than prefix — unlike `/m`, whose sub-screens (chat,
// suggestions, …) all still count as "Messages", the Pal's sub-screens
// under Messages (`/pal/home`, `/pal/chat/*`, `/pal/request/*`,
// `/pal/edit`) don't carry a `TabBar` at all (§7 of the plan), so there's
// nothing further to match there.
function buildTabs(pathname: string, messagesNeedsAttention: boolean, palHasReplyOwed: boolean): Tab[] {
  const inPal = pathname.startsWith('/pal')
  return [
    {
      key: 'home',
      label: 'Home',
      to: inPal ? '/pal/dashboard' : '/home',
      active: inPal ? pathname === '/pal/dashboard' : pathname.startsWith('/home'),
      activeIcon: iconNavHomeActive,
      inactiveIcon: iconNavHomeInactive,
    },
    { key: 'treatment', label: 'Treatment', icon: iconNavTreatment },
    {
      key: 'messages',
      label: 'Messages',
      to: inPal ? '/pal/messages' : '/m',
      active: inPal ? pathname === '/pal/messages' : pathname.startsWith('/m'),
      activeIcon: iconNavMessagesActive,
      inactiveIcon: iconNavMessagesInactive,
      dot: inPal
        ? // A member's message is sitting in one of her chats with no reply
          // from her yet (`palHasReplyOwed` below) — the request-side
          // equivalent, `PalRequestReminderCard`, is already loud on her
          // dashboard, so this is specifically about conversations already
          // under way, not new requests.
          palHasReplyOwed
          ? 'yellow'
          : undefined
        : // Covers everything happening on *her* Pixel Pal thread the member
          // wouldn't otherwise know about without opening Messages: an
          // unseen accept/decline or a request still sitting with a Pal
          // (see `messagesNeedsAttention` below).
          messagesNeedsAttention
          ? 'coral'
          : undefined,
    },
    { key: 'library', label: 'Library', icon: iconNavBook },
    { key: 'groups', label: 'Groups', icon: iconNavCommunity },
  ]
}

/**
 * Real app tab bar (Figma: Home & Contact screens). Home and Messages are
 * wired to the screens that actually exist here (/home, /m — "Contact us"
 * lives conceptually under Messages in the real app, matching the Contact
 * screen's own active-tab state). Treatment/Library/Groups are visual only
 * — those sections aren't built, so they're shown honestly rather than
 * faked as working.
 */
export function TabBar() {
  const { pathname } = useLocation()
  const lastOutcome = useDemoStore((s) => s.memberFlow.lastOutcome)
  const currentRelationshipId = useDemoStore((s) => s.memberFlow.currentRelationshipId)
  const relationships = useDemoStore((s) => s.relationships)
  const palId = useDemoStore((s) => s.palFlow.palId)

  const hasUnseenOutcome = !!lastOutcome && !lastOutcome.seenAt
  // "Still waiting" — a request she's sent is sitting with a Pal, unanswered.
  // There's no event to be "unseen" here (nothing has happened yet), so this
  // reads the live relationship directly rather than piggybacking on
  // `lastOutcome`, and — unlike that dot — nothing here ever clears it early.
  // Visiting Pending doesn't turn it off: the entire point is to outlast a
  // single visit, so it's still there days later when she's forgotten she's
  // waiting on anyone and lands back on Home. It clears itself the moment
  // `state` stops being `pending` — she withdrew, or a real outcome arrived
  // and `hasUnseenOutcome` takes over from here.
  const currentRel = currentRelationshipId ? relationships[currentRelationshipId] : undefined
  const isAwaitingReply = currentRel?.state === 'pending'

  // Pal side — a live conversation (active/quiet, not a pending request)
  // whose last message came from the member, not her. Same "waiting on
  // you" logic PalHome already derives per-thread (D13: no read receipts,
  // so this persists until she actually replies, not just until she opens
  // the chat) — here summed across all her threads onto one tab-level dot.
  const palHasReplyOwed = Object.values(relationships).some((r) => {
    if (r.palId !== palId || (r.state !== 'active' && r.state !== 'quiet')) return false
    const last = r.messages[r.messages.length - 1]
    return !!last && last.senderId !== palId
  })

  const tabs = buildTabs(pathname, hasUnseenOutcome || isAwaitingReply, palHasReplyOwed)

  return (
    <div className="flex items-start border-t border-lavender-20 bg-white px-2 pt-2">
      {tabs.map((tab) => {
        const isActive = tab.active ?? false
        const icon = tab.icon ?? (isActive ? tab.activeIcon : tab.inactiveIcon)
        const inner = (
          <div className="flex flex-1 flex-col items-center gap-0.5 pb-2">
            <div className="relative h-6 w-6">
              <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
              {tab.dot && (
                <span
                  aria-hidden="true"
                  className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-pill ${
                    tab.dot === 'yellow' ? 'bg-yellow-80' : 'bg-coral'
                  }`}
                />
              )}
            </div>
            <p className={isActive ? 'text-nav-label-active text-neutral-900' : 'text-nav-label text-navy-60'}>
              {tab.label}
            </p>
          </div>
        )

        if (!tab.to) {
          return (
            <div key={tab.key} className="flex flex-1">
              {inner}
            </div>
          )
        }

        return (
          <Link key={tab.key} to={tab.to} className="flex flex-1">
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
