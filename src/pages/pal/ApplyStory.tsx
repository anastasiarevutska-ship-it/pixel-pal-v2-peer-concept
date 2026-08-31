import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { TextArea } from '../../components/ui/TextArea'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'

/**
 * P3 · Your story — application step 2 of 5.
 *
 * Two things in one screen, distinct on purpose:
 *
 * 1. **About me** — a few lines, and the *only* one of these a member sees
 *    up front, on her suggestion card, before she ever opens a full profile.
 * 2. **The three-prompt story** (§5 A2) instead of a blank box — same
 *    writing effort, far better to read. These live in the full-profile
 *    sheet a member opens when deciding who to reach out to, not the card.
 *
 * Structured prompts throughout, never a free-form "write your bio" box —
 * that's the highest-friction input in the current product: a blank
 * required field addressed to an audience she hasn't seen yet.
 */
const storyFields = [
  {
    key: 'whereIWas' as const,
    label: 'Where I was',
    prompt: 'e.g. "Two failed IVF cycles before our daughter."',
  },
  {
    key: 'whatHelpedMe' as const,
    label: 'What helped me',
    prompt: 'e.g. "Someone who\'d normalize how angry I felt."',
  },
  {
    key: 'whatICanOffer' as const,
    label: 'What I can offer',
    prompt: 'e.g. "Honest talk about the two-week wait."',
  },
]

export default function ApplyStory() {
  const navigate = useNavigate()
  const draftStory = useDemoStore((s) => s.palFlow.draftStory)
  const setPalDraftStory = useDemoStore((s) => s.setPalDraftStory)

  const canContinue = draftStory.aboutMe.trim().length > 0 && draftStory.whereIWas.trim().length > 0

  return (
    <div className="flex min-h-full flex-col p-5">
      <RequestStepHeader
        step={1}
        total={5}
        onBack={() => navigate('/pal/apply/experience')}
        title="Your story"
      />

      <TextArea
        label="ABOUT me"
        name="aboutMe"
        rows={3}
        value={draftStory.aboutMe}
        onChange={(e) => setPalDraftStory({ aboutMe: e.target.value })}
        placeholder='e.g. "IVF mom of one, here for the hard days."'
        helperText="A few lines — this is what she sees first, on your card."
      />

      <p className="mb-4 mt-6 text-body-sm text-navy-60">
        Now the fuller story. A few lines each is plenty — this is what she reads once she opens
        your full profile.
      </p>

      <div className="flex flex-col gap-5">
        {storyFields.map((field) => (
          <TextArea
            key={field.key}
            label={field.label.toUpperCase()}
            name={field.key}
            rows={3}
            value={draftStory[field.key]}
            onChange={(e) => setPalDraftStory({ [field.key]: e.target.value })}
            placeholder={field.prompt}
          />
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button variant="primary" disabled={!canContinue} onClick={() => navigate('/pal/apply/capacity')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
