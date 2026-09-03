import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../../components/TabBar'
import { CareTeamBlock } from '../../components/CareTeamBlock'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { useDemoStore } from '../../store/useDemoStore'
import { useOngoingPalEntry } from '../../store/useOngoingPalEntry'
import bgGlow from '../../assets/contact/bg-glow.png'
import iconUserHeart from '../../assets/contact/icon-user-heart.svg'
import iconPeopleHeart from '../../assets/contact/icon-people-heart.svg'
import iconBellBody from '../../assets/home/icon-bell-body.svg'
import iconBellDot from '../../assets/home/icon-bell-dot.svg'

/**
 * M1 · Contacts entry (spec §7). Real screen — Figma file
 * `yuv1vQ8GyJLitbNh3Qawhl`, node 16785:21036 ("Contact"). The Care Team
 * communication block (Call/Messages/Video) is the real design; the Pixel
 * Pal card is merged into the empty space below it, per direct instruction
 * — that empty space is where spec §7 always meant it to live.
 *
 * **One Pixel Pal card, not two.** Find and Become briefly lived here as
 * two equally-weighted cards; they were structurally identical (same glass
 * card, same navy icon tile, same full-width navy pill), so the difference
 * was carried entirely by copy the eye skips, and the screen ended up with
 * two competing primary buttons — workshop §2.2A, which the split had
 * argued applied per-card. Receiving and giving are still both first-class;
 * the choice between them now gets a screen of its own (`PixelPalFork`),
 * where it's the whole point rather than something to disambiguate in
 * passing. This card describes the service and hands off to it.
 *
 * It only stays generic while she's cold. Once she has a request in flight,
 * an open thread, or an unseen accept/decline, `useOngoingPalEntry` turns it
 * into that thread's card and it goes straight there — a member mid-
 * conversation should never be re-offered the fork, and the cold action
 * (`startMemberFlow`) would wipe her remaining suggestions.
 *
 * Carries the real `TabBar` too (Figma shows this screen with Messages
 * active) — Home is reachable from here, and vice versa.
 */
export default function ContactsEntry() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const member = useDemoStore((s) => s.people[memberId])
  const retirePixelPalReminder = useDemoStore((s) => s.retirePixelPalReminder)
  const startMemberFlow = useDemoStore((s) => s.startMemberFlow)
  const ongoing = useOngoingPalEntry()

  // She's seen the real invite here — the Home dashboard's reminder card
  // retires rather than nagging her about a feature she now knows about.
  useEffect(() => {
    retirePixelPalReminder()
  }, [retirePixelPalReminder])

  const cardBody =
    ongoing?.body ??
    'Connect one-to-one with someone who understands. Share experiences, talk things through, and navigate fertility treatment together.'

  const primaryLabel = ongoing?.label ?? 'Find a Pixel Pal'

  // V2 is peer-to-peer only — no Member/Pal role fork in the active journey
  // (see docs/pixel-pal-v2-source-of-truth.md). This goes straight to the
  // same place the fork's own "Find" option did (`PixelPalFork.handleFind`),
  // just without that screen in between. The fork itself still exists at
  // `/m/pixel-pal` for reference; this card no longer routes through it.
  function handleFindPixelPal() {
    if (ongoing) {
      navigate(ongoing.to)
      return
    }
    startMemberFlow(memberId)
    navigate('/m/how-it-works')
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <img
        src={bgGlow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full object-cover"
      />

      <div className="relative flex flex-col gap-6 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={member?.displayName ?? ''} size="lg" />
            <div>
              <p className="text-body text-navy-80">How can we help,</p>
              <p className="text-body-bold text-navy-80">{member?.displayName}?</p>
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

        {/* Care Team communication options */}
        <CareTeamBlock />

        {/* Pixel Pal — merged into the empty space below (direct instruction).
            One card: the service, then one action. Cold it hands off to the
            fork; warm it *is* her thread (see the docblock). The two-person
            icon is deliberate over Find's single figure — this card is about
            the pairing, not about one side of it. */}
        <Card variant="glass" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex shrink-0 items-center justify-center rounded-field bg-navy p-3">
              <img
                src={ongoing ? iconUserHeart : iconPeopleHeart}
                alt=""
                aria-hidden="true"
                className="h-6 w-6"
              />
            </span>
            <p className="text-body-sm-bold text-navy-80">Pixel Pal</p>
          </div>
          {/* Same yellow-40 status treatment as Pending's "Still waiting?"
              notice — one shared look for all three "something to check"
              states (still waiting, accepted, declined), same as the
              generic invite copy and the ordinary "continue chatting"
              case (`isStatusUpdate: false`) don't get it: neither one is
              telling her something changed, so neither should look like it
              is. */}
          {ongoing?.isStatusUpdate ? (
            <div className="rounded-card bg-yellow-40 p-4">
              <p className="text-body text-navy-80">{cardBody}</p>
            </div>
          ) : (
            <p className="text-body text-navy-80">{cardBody}</p>
          )}
          <Button variant="primary" onClick={handleFindPixelPal}>
            {primaryLabel}
          </Button>
        </Card>

        <button
          type="button"
          onClick={() => navigate('/m/past')}
          className="text-label text-navy-60 underline-offset-4 hover:underline"
        >
          Past conversations →
        </button>
      </div>

      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
