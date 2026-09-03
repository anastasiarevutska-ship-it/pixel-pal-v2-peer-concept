import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Modal } from '../../components/ui/Modal'
import { AttachSheet } from '../../components/AttachSheet'
import { AttachmentBubble, PendingAttachmentChip } from '../../components/MessageAttachmentViews'
import { useDemoStore } from '../../store/useDemoStore'
import { mockMatch } from '../../lib/mockPixelPal'
import type { MessageAttachment } from '../../lib/types'

const starters = [
  {
    label: 'KEEP IT SIMPLE',
    message: "Hi! Nice to meet you. How's your week going?",
  },
  {
    label: 'TALK ABOUT TREATMENT',
    message: 'How have things been going for you lately?',
  },
  {
    label: 'TALK ABOUT SOMETHING ELSE',
    message: 'What do you like doing when you need a break from all of this?',
  },
]

type ThreadMessage = {
  id: string
  from: 'me' | 'them'
  body: string
  attachment?: MessageAttachment
}

/**
 * V2 first-contact conversation — where "Say hello" on `PixelPalMatchFound`
 * leads. A symmetric peer thread with River: no Member/Pal framing, no
 * request/accept state, no legacy Pal-side controls (milestone sharing,
 * Pal-only pause, report-that-really-ends-the-thread, graduate) — those are
 * explicitly out of scope, not just omitted by accident. The one menu this
 * screen does have (Find someone else / Pause / Report) is symmetric and
 * V2-only — see below.
 *
 * Deliberately its own screen rather than a reuse of `Chat.tsx`: that
 * screen is built around the legacy `relationships` store record (request
 * state, Pal reply-time copy, shared-treatment-context banner, milestone/
 * pause/report/graduate all reading and writing that record) — pulling it
 * in here would reintroduce exactly the mechanics this task says not to
 * add. Instead this reuses the same visual/interaction pieces that *are*
 * generic — `Avatar`, `TextField`, `AttachSheet`, `AttachmentBubble`/
 * `PendingAttachmentChip`, `Sheet`, `Modal`, and the message-bubble/
 * composer/send markup copied from `Chat.tsx` — without the relationship
 * model behind them. Messages live in local component state only; there is
 * no backing store record for this mocked match.
 *
 * `AttachSheet`'s "Send a check-in" row is omitted here (that prop is
 * optional precisely so callers without the check-in feature can skip it) —
 * check-ins are explicitly not part of this task.
 *
 * The Care Team notice reuses Chat.tsx's own clinical-boundary destination
 * (`navigate('/m')`, where the Care Team Messages option visually lives on
 * Contacts) rather than inventing a new one.
 *
 * River's identity comes from the shared `mockMatch` fixture
 * (`lib/mockPixelPal.ts`), the same one `PixelPalMatchFound` reads — not a
 * second copy of it.
 *
 * "Find someone else" is the only fully-wired menu item. Confirming it
 * calls `endPixelPalMatch()` (a plain prototype flag — there's no real
 * relationship record to close) and sends her back through the existing
 * `/m/finding` → demo-controlled outcome flow, same as first match. No
 * reason is captured or shown to River, and nothing here notifies her —
 * there's no mechanism to notify a mocked person in the first place. If
 * this screen is reached again (e.g. browser back) while
 * `pixelPalMatchEnded` is still true, it redirects to Messages instead of
 * rendering River as though the connection were still live; `PixelPalFinding`
 * clears the flag again once a fresh cycle starts.
 *
 * "Pause Pixel Pal" and "Report a concern" are intentionally
 * presentational-only in this task — see their handlers below.
 */
export default function PixelPalChat() {
  const navigate = useNavigate()
  const pixelPalMatchEnded = useDemoStore((s) => s.pixelPalMatchEnded)
  const endPixelPalMatch = useDemoStore((s) => s.endPixelPalMatch)

  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [findSomeoneElseOpen, setFindSomeoneElseOpen] = useState(false)

  const hasSentFirstMessage = messages.some((m) => m.from === 'me')

  // Reached via browser-back (or a stale tab) after she already left this
  // connection — don't render River as though it were still active.
  if (pixelPalMatchEnded) {
    return <Navigate to="/m" replace />
  }

  function handleSend() {
    if (!draft.trim() && !pendingAttachment) return
    setMessages((prev) => [
      ...prev,
      { id: `local-${prev.length}`, from: 'me', body: draft.trim(), attachment: pendingAttachment ?? undefined },
    ])
    setDraft('')
    setPendingAttachment(null)
  }

  // Fills the composer only — never sends on her behalf, and she can still
  // edit it first.
  function handleStarterTap(text: string) {
    setDraft(text)
  }

  function handleFindSomeoneElse() {
    endPixelPalMatch()
    setFindSomeoneElseOpen(false)
    navigate('/m/finding')
  }

  // Presentational-only for this task — see the file docblock. Both simply
  // close the menu; neither is wired into a real flow yet.
  function handlePausePlaceholder() {
    setMenuOpen(false)
  }

  function handleReportPlaceholder() {
    setMenuOpen(false)
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header — alias + non-identifying avatar only. No location, no
          exact treatment, no full real name, no compatibility score. */}
      <div className="flex items-center gap-3 border-b border-navy-20 p-4">
        <button
          type="button"
          onClick={() => navigate('/m')}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-h4 text-navy"
        >
          ←
        </button>
        <Avatar name={mockMatch.alias} size="sm" />
        <p className="flex-1 text-body-bold">{mockMatch.alias}</p>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 items-center gap-1 rounded-field px-3 text-body-sm-bold text-navy hover:bg-lavender-20"
        >
          Menu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Care Team / medical-question handoff — same clinical-boundary
            purpose as Chat.tsx's "Need a nurse?" footer link, same
            destination, applies symmetrically to both peers. Not a Pal,
            mentor, or care-provider claim about River — this is about where
            medical questions belong, not who River is. Deliberately compact
            and secondary to the conversation-starter block below it — a
            lightweight reminder, not a primary content card. */}
        <div className="mb-3 flex items-center justify-between gap-3 rounded-field bg-lavender-20 px-3 py-2">
          <div className="min-w-0">
            <p className="text-label-bold text-navy-80">Medical question?</p>
            <p className="text-label text-navy-60">Your Care Team is the best place to ask.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/m')}
            className="shrink-0 whitespace-nowrap text-label-bold text-navy underline-offset-4 hover:underline"
          >
            Message Care Team →
          </button>
        </div>

        {/* Messages — same bubble treatment as the existing chat. */}
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-card px-4 py-2.5 text-body-sm ${
                message.from === 'me' ? 'ml-auto bg-navy text-white' : 'mr-auto bg-white text-navy shadow-xs'
              }`}
            >
              {message.attachment && <AttachmentBubble attachment={message.attachment} />}
              {message.body}
            </div>
          ))}
        </div>

        {/* Conversation starters — only before her first message. Each card
            is a direction to open the conversation in, not a question to
            answer — the label is the direction (secondary, uppercase), the
            message underneath is what actually goes in the composer. */}
        {!hasSentFirstMessage && (
          <div className="mt-4 rounded-card border border-lavender-40 bg-lavender-20 p-4">
            <p className="text-body-bold text-navy">Not sure how to start?</p>
            <p className="mt-1 text-body-sm text-navy-60">Pick a direction, or write your own.</p>
            <div className="mt-3 flex flex-col gap-2">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => handleStarterTap(starter.message)}
                  className="rounded-field border border-navy-20 bg-white px-3 py-2.5 text-left transition-colors hover:border-navy-40"
                >
                  <p className="text-label-bold uppercase text-navy-60">{starter.label}</p>
                  <p className="mt-0.5 text-body-sm text-navy">{starter.message}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer — same pattern as the existing chat's +/input/Send row. */}
      <div className="border-t border-navy-20 pt-3">
        {pendingAttachment && (
          <PendingAttachmentChip attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
        )}
        <div className="flex items-center gap-2 p-3 pt-0">
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            aria-label="Add"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-navy-20 text-h4 text-navy hover:bg-lavender-20"
          >
            +
          </button>
          <div className="min-w-0 flex-1">
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-navy text-white hover:bg-navy-80"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M3.105 2.288a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.155.75.75 0 000-1.114A28.897 28.897 0 003.105 2.288z" />
            </svg>
          </button>
        </div>
      </div>

      <AttachSheet isOpen={attachOpen} onClose={() => setAttachOpen(false)} onAttach={setPendingAttachment} />

      {/* Relationship menu — symmetric, V2-only. Only "Find someone else" is
          wired; the other two are presentational placeholders (see the file
          docblock). */}
      <Sheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Conversation">
        <div className="flex flex-col gap-1">
          <MenuRow
            label="Find someone else"
            onClick={() => {
              setMenuOpen(false)
              setFindSomeoneElseOpen(true)
            }}
          />
          <MenuRow label="Pause Pixel Pal" onClick={handlePausePlaceholder} />
          <MenuRow label="Report a concern" onClick={handleReportPlaceholder} />
        </div>
      </Sheet>

      {/* Find someone else — confirmation. No reason captured, none shown
          to River (there's no mechanism to show River anything — she's a
          mocked fixture, not a live peer in this prototype). */}
      <Modal
        isOpen={findSomeoneElseOpen}
        onClose={() => setFindSomeoneElseOpen(false)}
        title="Find someone else?"
      >
        <p className="mb-4 text-body-sm text-navy-60">
          Sometimes a connection just isn&rsquo;t the right fit. You don&rsquo;t need to give a
          reason.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="destructive" onClick={handleFindSomeoneElse}>
            Find someone else
          </Button>
          <Button variant="ghost" onClick={() => setFindSomeoneElseOpen(false)}>
            Keep this Pixel Pal
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 items-center rounded-field px-3 text-left text-body-bold text-navy hover:bg-lavender-20"
    >
      {label}
    </button>
  )
}
