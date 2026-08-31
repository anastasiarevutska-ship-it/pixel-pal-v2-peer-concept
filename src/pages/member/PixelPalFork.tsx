import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { useDemoStore } from '../../store/useDemoStore'
import { useOngoingPalEntry } from '../../store/useOngoingPalEntry'
import iconUserHeart from '../../assets/contact/icon-user-heart.svg'
import iconPeopleHeart from '../../assets/contact/icon-people-heart.svg'

/**
 * `/m/pixel-pal` — the fork. Which side of Pixel Pal are you on?
 *
 * Replaces the two competing cards that used to sit side by side on the
 * Messages screen (M1). Those were structurally identical — same glass card,
 * same navy icon tile, same full-width navy pill — so the only thing
 * carrying the difference was copy the eye skips, and the screen ended up
 * with two primary buttons, which is exactly what workshop §2.2A says not to
 * do. Messages now carries one Pixel Pal card and the choice lives here,
 * where it's the whole screen instead of a thing to disambiguate in passing.
 *
 * **No shared onboarding in front of this.** Both branches already own one —
 * Find has M2 (`/m/how-it-works`), Become has P1 (`/pal/about`) — and both
 * are written for their own side: two of M2's three cards ("we'll suggest
 * three people", "you choose who feels right") are meaningless to a Pal.
 * A role-neutral screen ahead of the fork would mean rewriting those into
 * something vaguer *and* adding a fourth explanation in a row. The eyebrow +
 * one-sentence description on each option below is the onboarding; the order
 * is Messages card (what it is) → here (which side) → M2/P1 (what it
 * involves), each step adding rather than repeating.
 *
 * The two paths are mutually exclusive per surface, not permanently: nothing
 * here locks her out of the other side, because a graduating member being
 * asked "would you do this for someone else?" is spec §0's third protected
 * moment. What's gone is only ever being offered both at once.
 *
 * Find is state-aware (`useOngoingPalEntry`) even though the Messages card
 * skips this screen whenever she has something in flight — browser-back onto
 * this screen mid-flow is ordinary, and the cold action wipes her shortlist.
 * Become has no equivalent variant because it has no reachable one: applying
 * writes a profile for `palFlow.palId` (Jordan), never for the member on
 * this screen (Samantha), so an "already a Pal" state here would be
 * unreachable dead UI — same call M2's removed fork got.
 */

type Option = {
  icon: string
  eyebrow: string
  title: string
  body: string
  onClick: () => void
}

function OptionCard({ icon, eyebrow, title, body, onClick }: Option) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex cursor-pointer flex-col gap-3 transition-colors hover:bg-lavender-20"
    >
      <div className="flex items-center gap-3">
        <span className="flex shrink-0 items-center justify-center rounded-field bg-navy p-3">
          <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-label-bold uppercase text-navy-60">{eyebrow}</p>
          <p className="text-body-bold text-navy">{title}</p>
        </div>
        <span aria-hidden="true" className="text-body-bold text-navy">
          →
        </span>
      </div>
      <p className="text-body-sm text-navy-60">{body}</p>
    </Card>
  )
}

export default function PixelPalFork() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const startMemberFlow = useDemoStore((s) => s.startMemberFlow)
  const ongoing = useOngoingPalEntry()

  function handleFind() {
    if (ongoing) {
      navigate(ongoing.to)
      return
    }
    startMemberFlow(memberId)
    navigate('/m/how-it-works')
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="Pixel Pal" onBack={() => navigate('/m')} />

      <p className="text-body text-navy-60">
        Two ways in. Pick whichever fits — you can always come back for the other.
      </p>

      <div className="flex flex-col gap-3">
        <OptionCard
          icon={iconUserHeart}
          // The eyebrow is a "which of these are you" label, so it stops
          // making sense once she's answered it — "if you're in it now"
          // above "See your request" reads as a question already settled.
          eyebrow={ongoing ? 'Where you left off' : 'If you’re in it now'}
          title={ongoing ? ongoing.label : 'Find a Pixel Pal'}
          body={
            ongoing?.body ??
            'Get matched with someone who’s been through the treatment you’re in. Three suggestions, each with a reason — you choose.'
          }
          onClick={handleFind}
        />

        <OptionCard
          icon={iconPeopleHeart}
          eyebrow="If you’ve been there"
          title="Become a Pixel Pal"
          body="Share what helped you with someone who’s where you were. One person, one cycle — and you set the pace."
          onClick={() => navigate('/pal')}
        />
      </div>
    </div>
  )
}
