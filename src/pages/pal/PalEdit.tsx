import { Navigate, useNavigate } from 'react-router-dom'
import { TextArea } from '../../components/ui/TextArea'
import { Button } from '../../components/ui/Button'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { CapacityPicker } from './CapacityPicker'
import { ReplyTimePicker } from './ReplyTimePicker'
import { useDemoStore } from '../../store/useDemoStore'
import type { Availability } from '../../lib/types'

// Two states, not three. Whether one specific conversation is paused lives
// on that conversation ("Pause this conversation" in its own menu) — it's
// not a mode she sets here, and it never shows up as a third option in this
// list, on purpose.
const availabilityOptions: { key: Availability; label: string; detail: string }[] = [
  { key: 'available', label: 'Available', detail: 'New members can reach out to you.' },
  {
    key: 'not_taking_new',
    label: 'Not taking new',
    detail: 'Keep your current conversations, but stop receiving new requests.',
  },
]

const storyFields = [
  { key: 'aboutMe' as const, label: 'About me', helper: 'A few lines — this is what she sees first, on your card.' },
  { key: 'whereIWas' as const, label: 'Where I was' },
  { key: 'whatHelpedMe' as const, label: 'What helped me' },
  { key: 'whatICanOffer' as const, label: 'What I can offer' },
]

/**
 * Edit your profile — everything from the application (workshop §6.5 step
 * 1) that isn't a one-time answer. Pal home's job is requests, ongoing
 * conversations, and impact; anything about *her* — what she wrote,
 * capacity, reply time, availability — lives here instead, one level down,
 * so the home screen isn't a settings page first and a queue second.
 *
 * Every control here writes straight to the live profile via the same
 * store actions Pal home used to call inline (`setPalStory`,
 * `setPalCapacity`, `setPalReplyHours`, `setPalAvailability`) — there's no
 * separate draft/save step, consistent with how capacity and reply time
 * already behaved before this screen existed.
 */
export default function PalEdit() {
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const profile = useDemoStore((s) => s.palProfiles[palId])
  const relationships = useDemoStore((s) => s.relationships)
  const setPalStory = useDemoStore((s) => s.setPalStory)
  const setPalCapacity = useDemoStore((s) => s.setPalCapacity)
  const setPalReplyHours = useDemoStore((s) => s.setPalReplyHours)
  const setPalAvailability = useDemoStore((s) => s.setPalAvailability)

  if (!profile) return <Navigate to="/pal/about" replace />

  const ongoing = Object.values(relationships).filter(
    (r) => r.palId === palId && (r.state === 'active' || r.state === 'quiet'),
  ).length

  return (
    <div className="flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="Edit your profile" onBack={() => navigate('/pal/home')} />

      <div className="flex flex-col gap-5">
        {storyFields.map((field) => (
          <TextArea
            key={field.key}
            label={field.label.toUpperCase()}
            name={field.key}
            rows={3}
            value={profile.story[field.key]}
            onChange={(e) => setPalStory({ [field.key]: e.target.value })}
            helperText={field.helper}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-bold uppercase text-navy-60">How many at once</p>
        <CapacityPicker value={profile.capacity} min={Math.max(1, ongoing)} onChange={setPalCapacity} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-bold uppercase text-navy-60">How quickly you usually reply</p>
        <ReplyTimePicker value={profile.typicalReplyHours} onChange={setPalReplyHours} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label-bold uppercase text-navy-60">Right now</p>
        {availabilityOptions.map((option) => {
          const selected = profile.availability === option.key
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setPalAvailability(option.key)}
              aria-pressed={selected}
              className={`flex min-h-11 items-center gap-3 rounded-field border p-3 text-left transition-colors ${
                selected ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white hover:border-navy-40'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 shrink-0 rounded-pill ${selected ? 'bg-lavender' : 'bg-navy-20'}`}
              />
              <span className="min-w-0">
                <span className="block text-body-sm-bold">{option.label}</span>
                <span className={`block text-label ${selected ? 'text-lavender-40' : 'text-navy-60'}`}>
                  {option.detail}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto pt-2">
        <Button variant="primary" onClick={() => navigate('/pal/home')}>
          Done
        </Button>
      </div>
    </div>
  )
}
