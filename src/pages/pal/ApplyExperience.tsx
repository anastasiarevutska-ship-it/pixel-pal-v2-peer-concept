import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RequestStepHeader } from '../../components/RequestStepHeader'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'
import { treatmentLabels } from '../../lib/treatmentLabels'
import type { TreatmentCode } from '../../lib/types'

const codes = Object.keys(treatmentLabels) as TreatmentCode[]

/**
 * P2 · Your experience — application step 1 of 5.
 *
 * Three fixes to today's checklist, all from the audit's §2.2B finding:
 *
 * 1. **Every option is defined**, in one plain sentence. Bare acronyms turn
 *    a volunteering step into a medical self-classification test, and
 *    patients frequently don't know the formal name of their own protocol.
 * 2. **It's prefilled from her record**, so the common case is confirming
 *    rather than recalling. Unlike M3 this step is still *shown*: here it's
 *    a declaration of what she's offering to support on, which is hers to
 *    edit, not ours to assume.
 * 3. **"I'm not sure" exists.** It doesn't block her — nothing here is a
 *    human-reviewed gate, so an honest "I don't know the names" costs her
 *    nothing and still lets her through to the rest of the application.
 */
export default function ApplyExperience() {
  const navigate = useNavigate()
  const draftExperience = useDemoStore((s) => s.palFlow.draftExperience)
  const setPalDraftExperience = useDemoStore((s) => s.setPalDraftExperience)
  const [notSure, setNotSure] = useState(false)

  function toggle(code: TreatmentCode) {
    setNotSure(false)
    setPalDraftExperience(
      draftExperience.includes(code)
        ? draftExperience.filter((c) => c !== code)
        : [...draftExperience, code],
    )
  }

  const canContinue = draftExperience.length > 0 || notSure

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable region — everything except the primary action, so the
          treatment list can grow past one screen without ever carrying the
          Continue button off-screen with it. `pb-4` on top of the list's
          own trailing content keeps the last option (or the "not sure"
          note) clear of the fixed action area below, not pressed against
          it. */}
      <div className="flex-1 overflow-y-auto p-5 pb-4">
        <RequestStepHeader step={0} total={5} onBack={() => navigate('/pal/about')} title="Your experience" />
        <p className="-mt-2 mb-4 text-body-sm text-navy-60">
          We&rsquo;ve filled in what your record shows. Update anything that&rsquo;s missing.
        </p>

        <div className="flex flex-col gap-2">
          {codes.map((code) => {
            const entry = treatmentLabels[code]
            const selected = draftExperience.includes(code)
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggle(code)}
                aria-pressed={selected}
                className={`flex min-h-11 items-start gap-3 rounded-field border p-3 text-left transition-colors ${
                  selected ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white hover:border-navy-40'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-field border text-label-bold ${
                    selected ? 'border-white bg-white text-navy' : 'border-navy-20'
                  }`}
                >
                  {selected ? '✓' : ''}
                </span>
                <span className="min-w-0">
                  <span className="block text-body-sm-bold">
                    {entry.label}
                    {entry.acronym && (
                      <span className={selected ? ' text-lavender-40' : ' text-navy-60'}> ({entry.acronym})</span>
                    )}
                  </span>
                  <span className={`block text-label ${selected ? 'text-lavender-40' : 'text-navy-60'}`}>
                    {entry.definition}
                  </span>
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => {
              setNotSure((v) => !v)
              setPalDraftExperience([])
            }}
            aria-pressed={notSure}
            className={`flex min-h-11 items-center rounded-field border border-dashed px-3 text-body-sm-bold transition-colors ${
              notSure ? 'border-navy bg-lavender-20 text-navy' : 'border-navy-40 bg-white text-navy-60'
            }`}
          >
            I&rsquo;m not sure what mine were called
          </button>
        </div>

        {notSure && (
          <p className="mt-3 rounded-field bg-lavender-20 px-3 py-2 text-body-sm text-navy-80">
            That&rsquo;s completely normal — there&rsquo;s no wrong answer here, and nothing about your
            application depends on getting the names exactly right.
          </p>
        )}
      </div>

      {/* Fixed action area — a plain flex sibling of the scrollable region
          above, not an overlay, so there's no chance of it covering
          content (same pattern the chat screens use for their composer). */}
      <div className="p-5 pt-3">
        <Button variant="primary" disabled={!canContinue} onClick={() => navigate('/pal/apply/story')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
