import { useNavigate } from 'react-router-dom'
import { MobileShell } from '../components/MobileShell'
import { TabBar } from '../components/TabBar'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useDemoStore } from '../store/useDemoStore'
import { useOngoingPalEntry } from '../store/useOngoingPalEntry'
import bgGlow from '../assets/home/bg-glow.png'
import iconBellBody from '../assets/home/icon-bell-body.svg'
import iconBellDot from '../assets/home/icon-bell-dot.svg'
import iconPeopleHeart from '../assets/contact/icon-people-heart.svg'

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="white" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}

// Lightweight mock content consistent with the reference screenshot — not
// production data, and no equivalent group content exists elsewhere in the
// prototype to reuse instead. Thumbnails are flat color blocks from the
// existing token set (no new image assets) rather than real photos/video.
const mockGroups = [
  {
    id: 'fertility-on-ice',
    tone: 'bg-lavender-40',
    title: 'Fertility on Ice',
    description: 'A community of those who have chosen to freeze their eggs',
  },
  {
    id: 'gestational-carrier',
    tone: 'bg-yellow-40',
    title: 'Gestational Carrier',
    description: 'A space for sharing personal experiences related to Gestational Carrier',
  },
  {
    id: 'fertility-journey',
    tone: 'bg-lavender-20',
    title: 'Fertility Journey',
    description: 'An environment where people can discuss fertility treatments',
  },
]

/**
 * `/groups` — Community / Groups tab, the fifth Main App bottom-nav item
 * (Home, Treatment, Messages, Library, Groups). Layout reference: client
 * screenshot "Community_Home_NoGroups" — used for structure only; the group
 * names/descriptions above are lightweight mock content consistent with
 * that reference, not a requirement to match verbatim.
 *
 * Not part of Pixel Pal M1–M9, same as `/home` — a Main App screen Pixel
 * Pal cross-promotes *into*, not the other way around. Presentational only:
 * "Explore Groups" and the group cards have no join/follow flow (not asked
 * for in this task).
 *
 * The Pixel Pal promo card is deliberately a bordered, distinctly-styled
 * block between the CTA and "Groups for you" — never a group card itself.
 * Its CTA reuses the exact same cold-start entry logic ContactsEntry's
 * Messages card already uses (`useOngoingPalEntry` + `startMemberFlow` +
 * `/m/how-it-works`) — not a second Pixel Pal flow, another door into the
 * same one. An ongoing connection routes straight to it, same as Messages.
 */
export default function CommunityGroups() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const member = useDemoStore((s) => s.people[memberId])
  const startMemberFlow = useDemoStore((s) => s.startMemberFlow)
  const ongoing = useOngoingPalEntry()

  function handleFindPixelPal() {
    if (ongoing) {
      navigate(ongoing.to)
      return
    }
    startMemberFlow(memberId)
    navigate('/m/how-it-works')
  }

  return (
    <MobileShell>
      <div className="relative flex min-h-full flex-col">
        <img
          src={bgGlow}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] w-full object-cover"
        />

        <div className="relative flex flex-col gap-6 p-5 pb-8">
          {/* Header — same avatar/greeting/bell pattern as Home and
              Contacts. */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={member?.displayName ?? ''} src={member?.avatarUrl || undefined} size="lg" />
              <div>
                <p className="text-body text-navy-80">Join the conversation,</p>
                <p className="text-body-bold text-navy-80">{member?.displayName}!</p>
              </div>
            </div>
            <div className="relative h-5 w-5 shrink-0">
              <img src={iconBellBody} alt="Notifications" className="h-full w-full" />
              <img
                src={iconBellDot}
                alt=""
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
              />
            </div>
          </div>

          {/* Empty state */}
          <p className="mt-4 text-center text-h3 text-navy">You&rsquo;re not following any groups yet.</p>

          {/* Explore Groups — presentational only, no group-browsing flow
              yet. */}
          <Button variant="secondary">Explore Groups</Button>

          {/* Pixel Pal cross-promo — distinct card treatment from the group
              recommendation cards below: bordered, its own eyebrow, never
              laid out or labeled as a group. Deliberately compact/secondary
              relative to the Groups content around it — tight padding and
              line spacing, text-only CTA, no full-size card treatment. The
              icon reuses the existing two-person "pairing" mark (see
              ContactsEntry's Pixel Pal card and Launcher's entry card for
              the same icon/reasoning) — not a heart, not a chat bubble. */}
          <div className="flex flex-col gap-1.5 rounded-card border border-lavender-40 bg-lavender-20 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-field bg-navy p-1">
                <img src={iconPeopleHeart} alt="" aria-hidden="true" className="h-3 w-3" />
              </span>
              <p className="text-label-bold uppercase text-lavender">Pixel Pal</p>
            </div>
            <p className="text-body-bold text-navy">Prefer a one-to-one conversation?</p>
            <p className="text-body-sm text-navy-60">Connect privately with someone who can relate.</p>
            <button
              type="button"
              onClick={handleFindPixelPal}
              className="self-start text-label-bold text-navy underline-offset-4 hover:underline"
            >
              Find a Pixel Pal →
            </button>
          </div>

          {/* Groups for you */}
          <div className="flex flex-col gap-3">
            <p className="text-label-bold uppercase text-navy-60">Groups for you</p>
            {mockGroups.map((group) => (
              <div key={group.id} className="flex items-center gap-3 rounded-card bg-lavender-20 p-3">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-field ${group.tone}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-navy/60">
                    <PlayIcon />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-body-bold text-navy">{group.title}</p>
                  <p className="text-body-sm text-navy-60">{group.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-auto">
          <TabBar />
        </div>
      </div>
    </MobileShell>
  )
}
