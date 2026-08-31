import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextArea } from '../../components/ui/TextArea'
import { Button } from '../../components/ui/Button'
import { useDemoStore } from '../../store/useDemoStore'
import { palHistoryFor } from '../../lib/palHistory'

const prompts = [
  'Tell her where you are right now.',
  "Ask her something you've been wondering.",
  'Share what made you choose her.',
]

// Reconnecting is a different blank page than meeting. "Tell her where you
// are right now" assumes she doesn't know; "share what made you choose her"
// asks a question that already has an awkward answer. These don't pretend
// the gap didn't happen, and they don't ask her to explain it either.
const reconnectPrompts = [
  'Tell her what’s changed since you last talked.',
  'Pick up where you left off.',
  'Say what you’re hoping for this time.',
]

/** M5 · Say hello [KEY MOMENT] (spec §7). Optional note, scaffolded with
 * rotating prompts; character guidance, not a hard limit. */
export default function SayHello() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const shortlist = useDemoStore((s) => s.memberFlow.shortlist)
  const people = useDemoStore((s) => s.people)
  const relationships = useDemoStore((s) => s.relationships)
  const sendIntroNote = useDemoStore((s) => s.sendIntroNote)

  const chosen = shortlist.find((s) => s.state === 'chosen')
  const pal = chosen ? people[chosen.palId] : undefined
  // She may have chosen someone she's talked to before (see palHistory.ts).
  // The card told her so; this screen shouldn't then hand her a blank note
  // field captioned as if they'd never met.
  const history = chosen ? palHistoryFor(relationships, memberId, chosen.palId) : null
  const activePrompts = history ? reconnectPrompts : prompts

  const [note, setNote] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)

  useEffect(() => {
    if (!chosen || !pal) navigate('/m/suggestions', { replace: true })
  }, [chosen, pal, navigate])

  if (!chosen || !pal) return null

  function handleSend() {
    sendIntroNote(memberId, chosen!.palId, note.trim())
    navigate('/m/pending')
  }

  return (
    <div className="flex h-full flex-col p-5">
      <button
        type="button"
        onClick={() => navigate('/m/suggestions')}
        aria-label="Back to suggestions"
        className="mb-2 flex h-11 w-11 -translate-x-3 items-center justify-center text-h4 text-navy"
      >
        ←
      </button>
      <h2 className="text-h3">
        {history ? `Say hello to ${pal.displayName} again` : `Say hello to ${pal.displayName}`}
      </h2>
      <p className="mt-1 text-body-sm text-navy-60">
        {history
          ? 'She’ll see this as a new conversation — your earlier one stays where it is.'
          : 'A short note helps her know where to start — totally optional.'}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setPromptIndex((i) => (i + 1) % activePrompts.length)}
          className="flex w-full flex-col items-start gap-0.5 rounded-field bg-lavender-20 px-3 py-2 text-left transition-colors hover:bg-lavender-40"
        >
          <span className="text-label-bold text-navy-60">TRY THIS</span>
          <span className="text-body-sm text-navy-80">{activePrompts[promptIndex]}</span>
        </button>
        <TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a few lines…"
          rows={4}
          helperText={note.length > 0 ? `${note.length} characters — short and simple is perfect` : undefined}
        />
      </div>

      <div className="mt-auto pt-6">
        <Button variant="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  )
}
