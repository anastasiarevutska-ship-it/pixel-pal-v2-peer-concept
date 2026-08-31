import { Outlet } from 'react-router-dom'
import { MobileShell } from '../../components/MobileShell'
import iconUserHeart from '../../assets/contact/icon-user-heart.svg'

/** Layout for every /m/* route — PhoneFrame + backdrop + demo controls,
 * shared across the whole M1–M9 journey. */
export default function MemberLayout() {
  return (
    <MobileShell
      context={{
        icon: iconUserHeart,
        eyebrow: 'Member experience',
        title: 'Support that starts with choice',
        description: 'Find someone who understands, connect, and get support.',
        // The entry screen (M1, `ContactsEntry`) — collapses once she taps
        // "Get started" and leaves it for the fork or her own thread.
        expandedPaths: ['/m'],
      }}
    >
      <Outlet />
    </MobileShell>
  )
}
