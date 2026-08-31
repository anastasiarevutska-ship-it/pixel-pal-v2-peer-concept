import { useNavigate } from 'react-router-dom'
import { CareTeamBlock } from '../../components/CareTeamBlock'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { TabBar } from '../../components/TabBar'
import { useDemoStore } from '../../store/useDemoStore'
import bgGlow from '../../assets/contact/bg-glow.png'
import iconPeopleHeart from '../../assets/contact/icon-people-heart.svg'
import iconBellBody from '../../assets/home/icon-bell-body.svg'
import iconBellDot from '../../assets/home/icon-bell-dot.svg'

/**
 * `/pal/messages` — Jordan's Messages tab. Same base as the Requester's
 * Contacts (M1), deliberately (§6.2): same glow header, same
 * `CareTeamBlock`, and — since M1 collapsed its own two Pixel Pal cards into
 * one — a single Pixel Pal card here too.
 *
 * Hers doesn't fork. The member's card leads to `/m/pixel-pal` because she
 * hasn't picked a side; Jordan already has, so her card goes straight to her
 * Pal home (P8). That's what "one path at a time per surface" means here.
 *
 * This replaces the inert "Find a Pixel Pal" card that used to sit above the
 * Pal Home card — a `<div>` dressed as a button, kept for realism (she's a
 * patient too) but deliberately dead, because the member journey (M2–M9) is
 * seeded entirely around Samantha and wiring it up would silently run her
 * shortlist and threads under Jordan's name. One card per surface makes the
 * dead control unnecessary rather than merely honest.
 *
 * Before she has a `PalProfile` the card invites her to apply instead —
 * reachable only by deep link, since `/pal` routes an unapplied Jordan to
 * P1 before this screen ever renders.
 */
export default function PalMessages() {
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const person = useDemoStore((s) => s.people[palId])
  const profile = useDemoStore((s) => s.palProfiles[palId])

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
            <Avatar name={person?.displayName ?? ''} size="lg" />
            <div>
              <p className="text-body text-navy-80">How can we help,</p>
              <p className="text-body-bold text-navy-80">{person?.displayName}?</p>
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

        <CareTeamBlock />

        {/* One Pixel Pal card — her side is already chosen, so no fork */}
        <Card variant="glass" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex shrink-0 items-center justify-center rounded-field bg-navy p-3">
              <img src={iconPeopleHeart} alt="" aria-hidden="true" className="h-6 w-6" />
            </span>
            <p className="text-body-sm-bold text-navy-80">Pixel Pal</p>
          </div>
          <p className="text-body text-navy-80">
            {profile
              ? 'Requests waiting on you, the conversations you’re in, and what they’ve added up to.'
              : 'Members reach out when they want to talk to someone who’s actually been through it. If that’s you, share what helped — nothing clinical, just your experience.'}
          </p>
          <Button variant="primary" onClick={() => navigate(profile ? '/pal/home' : '/pal/about')}>
            {profile ? 'Pal Home' : 'Become a Pixel Pal'}
          </Button>
        </Card>
      </div>

      <div className="relative mt-auto">
        <TabBar />
      </div>
    </div>
  )
}
