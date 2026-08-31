import { Outlet } from 'react-router-dom'
import { MobileShell } from '../../components/MobileShell'
import iconPeopleHeart from '../../assets/contact/icon-people-heart.svg'

/** Layout for every /pal/* route — the same PhoneFrame, backdrop, and demo
 * controls the member journey uses. Identical shell on purpose: this is one
 * app with two sides, not two products. */
export default function PalLayout() {
  return (
    <MobileShell
      context={{
        icon: iconPeopleHeart,
        eyebrow: 'Pal experience',
        title: 'Support without losing yourself',
        description: 'Offer support while staying in control of your time and capacity.',
        // `/pal` is the router (redirects instantly) and `/pal/about` is
        // P1's card intro — collapses once "Let's go"/"Skip" fires
        // `startPalApplication` and moves her into the real flow.
        expandedPaths: ['/pal', '/pal/about'],
      }}
    >
      <Outlet />
    </MobileShell>
  )
}
