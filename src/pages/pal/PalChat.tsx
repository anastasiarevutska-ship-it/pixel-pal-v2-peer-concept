import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { Tag } from '../../components/ui/Tag'
import { TextArea } from '../../components/ui/TextArea'
import { QuietThreadNotice } from '../../components/QuietThreadNotice'
import { AttachSheet } from '../../components/AttachSheet'
import { AttachmentBubble, PendingAttachmentChip } from '../../components/MessageAttachmentViews'
import { useDemoStore } from '../../store/useDemoStore'
import { supportNeedLabels, treatmentLabels } from '../../lib/treatmentLabels'
import { reportReasons } from '../../lib/reportReasons'
import type { MessageAttachment } from '../../lib/types'

/** Openers for the Pal's first reply — the highest-leverage anti-drop-off
 * fix in the chat (D13). Two strangers and a blank thread on a subject
 * that's genuinely hard to open is where relationships die. */
const openers = [
  'I remember that feeling exactly.',
  'Thank you for writing — what would help most right now?',
  'There’s no question here that’s too small.',
]

/** Pre-written handoff, dropped into her composer rather than sent for her.
 * The escalation affordance (§5 D1) matters most for the Pal: it gives her
 * a graceful exit from a question she shouldn't answer, at the exact moment
 * today's product leaves a volunteer improvising alone. */
const careTeamHandoff =
  'That one’s really worth asking your care team — they can answer it properly. I can tell you how it felt for me, but not what’s right for you.'

const statusCopy: Partial<Record<string, string>> = {
  archived: 'This conversation has ended. It stays here so you can look back on it.',
  graduated: 'You saw her through to the end. This conversation stays here.',
}

const pauseDurationOptions: { key: 'one_week' | 'until_ready'; label: string }[] = [
  { key: 'one_week', label: '1 week' },
  { key: 'until_ready', label: 'Until I’m ready' },
]

/**
 * P10 · Supporting someone (workshop §6.5 step 5) — the Pal's side of the
 * thread. Deliberately the same shape as the member's chat, because
 * symmetry is a rule of this concept, not a preference: both sides see the
 * same fields, and neither sees read receipts or last-seen (D13).
 *
 * What's specific to the Pal:
 *   · openers on a thread she hasn't answered yet
 *   · one-time composer guidance before her first message, in context,
 *     where the guidelines document is useless (§5 D2)
 *   · the care-team handoff, which is hers to send in her own words
 */
export default function PalChat() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const palId = useDemoStore((s) => s.palFlow.palId)
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const member = useDemoStore((s) => s.people[relationship?.memberId ?? ''])
  const memberRequests = useDemoStore((s) => s.memberRequests)
  const sendMessage = useDemoStore((s) => s.sendMessage)
  const pauseRelationship = useDemoStore((s) => s.pauseRelationship)
  const resumeRelationship = useDemoStore((s) => s.resumeRelationship)
  const reportRelationship = useDemoStore((s) => s.reportRelationship)

  const [draft, setDraft] = useState('')
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const [reportNote, setReportNote] = useState('')
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseDuration, setPauseDuration] = useState<'one_week' | 'until_ready' | null>(null)
  const [toast, setToast] = useState('')

  if (!relationship || !member) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">Conversation not found.</p>
      </div>
    )
  }

  const request = Object.values(memberRequests)
    .filter((r) => r.memberId === relationship.memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const canChat = relationship.state === 'active' || relationship.state === 'quiet'
  // Same scope as the member's Chat.tsx: a real, still-live conversation —
  // not one already ended, not a still-`pending` note.
  const canReport = ['active', 'quiet', 'paused'].includes(relationship.state)
  const myMessages = relationship.messages.filter((m) => m.senderId === palId)
  const notYetReplied = myMessages.length === 0

  function flashToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }

  function handleSend() {
    if (!draft.trim() && !pendingAttachment) return
    sendMessage(relationship.id, palId, draft.trim(), 'text', pendingAttachment ?? undefined)
    setDraft('')
    setPendingAttachment(null)
  }

  function handleCheckIn() {
    sendMessage(relationship.id, palId, 'Thinking of you today.', 'checkin')
    // Same fix as the member's Chat.tsx — check-in was the one action here
    // with no confirmation at all, unlike Pause. Symmetry (§6.3) applies to
    // this gap too, not just to what's shown.
    flashToast('Check-in sent.')
  }

  // "Pause this conversation" opens a small guided step (duration, then
  // confirm) rather than pausing immediately — the duration is her stated
  // intent, not a technicality, so it's worth one extra tap rather than
  // defaulting it silently.
  function handleOpenPause() {
    setMenuOpen(false)
    setPauseDuration(null)
    setPauseOpen(true)
  }

  function handleConfirmPause() {
    if (!pauseDuration) return
    pauseRelationship(relationship.id, palId, pauseDuration)
    setPauseOpen(false)
    flashToast('Conversation paused — resume anytime.')
  }

  function handleResume() {
    resumeRelationship(relationship.id)
    flashToast('Conversation resumed.')
  }

  function handleOpenReport() {
    setMenuOpen(false)
    setReportReason(null)
    setReportNote('')
    setReportSubmitted(false)
    setReportOpen(true)
  }

  // Ends the match on submit, frees her capacity slot immediately, and
  // asks nothing of her beyond a reason — she never has to explain herself
  // to him, which is the whole point of Report over Wrap up / Pause.
  function handleSubmitReport() {
    if (!reportReason) return
    reportRelationship(relationship.id, palId, reportReason, reportNote.trim() || undefined)
    setReportSubmitted(true)
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-navy-20 p-4">
        <button
          type="button"
          onClick={() => navigate('/pal/home')}
          aria-label="Back to Pal home"
          className="flex h-11 w-8 shrink-0 items-center text-h4 text-navy"
        >
          ←
        </button>
        <Avatar name={member.displayName} src={member.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-body-bold">{member.displayName}</p>
          <p className="truncate text-label text-navy-60">{relationship.sharedContext}</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 shrink-0 items-center rounded-field px-3 text-body-sm-bold text-navy hover:bg-lavender-20"
        >
          Menu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {statusCopy[relationship.state] && (
          <div className="mb-4 rounded-field bg-yellow-40 px-3 py-2 text-center text-body-sm text-navy-80">
            {statusCopy[relationship.state]}
          </div>
        )}

        {/* Her own paused view — distinct from the member's (below), and
            from `statusCopy`'s single-line treatment for `archived`/
            `graduated`: this one carries the primary action, since she's
            the only person who can resume it. Never framed as an ending. */}
        {relationship.state === 'paused' && (
          <div className="mb-4 rounded-card bg-yellow-40 p-4 text-center">
            <p className="text-body-sm-bold text-navy">This conversation is paused</p>
            <p className="mt-1 text-body-sm text-navy-80">Nothing is lost. Resume whenever you’re ready.</p>
            {relationship.pauseDuration === 'one_week' && relationship.pausedAt && (
              <p className="mt-1 text-label text-navy-60">
                We&rsquo;ll remind you around{' '}
                {new Date(
                  new Date(relationship.pausedAt).getTime() + 7 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
                — it won&rsquo;t resume on its own.
              </p>
            )}
            <div className="mt-3">
              <Button variant="primary" fullWidth={false} onClick={handleResume}>
                Resume conversation
              </Button>
            </div>
          </div>
        )}

        {/* Same notice the member sees, same wording — §6.3 symmetry. */}
        {relationship.state === 'quiet' && (
          <QuietThreadNotice otherName={member.displayName} lastMessageAt={relationship.lastMessageAt} />
        )}

        <div className="flex flex-col gap-3">
          {relationship.messages.map((message) => {
            if (message.kind === 'checkin') {
              const mine = message.senderId === palId
              return (
                <div
                  key={message.id}
                  className="mx-auto rounded-pill bg-lavender-20 px-4 py-1.5 text-body-sm text-navy-80"
                >
                  {mine ? 'You sent a check-in' : `${member.displayName} is thinking of you`}
                </div>
              )
            }
            const isMe = message.senderId === palId
            return (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-card px-4 py-2.5 text-body-sm ${
                  isMe ? 'ml-auto bg-navy text-white' : 'mr-auto bg-white text-navy shadow-xs'
                }`}
              >
                {message.attachment && <AttachmentBubble attachment={message.attachment} />}
                {message.body}
              </div>
            )
          })}
        </div>

        {/* Openers — only until she's said something of her own */}
        {canChat && notYetReplied && (
          <div className="mt-5 flex flex-col gap-2">
            <p className="text-label-bold uppercase text-navy-60">Not sure how to start?</p>
            {openers.map((opener) => (
              <button
                key={opener}
                type="button"
                onClick={() => setDraft(opener)}
                className="rounded-field border border-navy-20 bg-white px-3 py-2 text-left text-body-sm text-navy-80 hover:border-lavender"
              >
                {opener}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* One-time, in-context guidance — where the guidelines document isn't */}
      {canChat && notYetReplied && (
        <p className="border-t border-navy-20 bg-lavender-20 px-4 py-2 text-center text-label text-navy-80">
          Share your experience, not advice. Anything medical goes to her care team.
        </p>
      )}

      {canChat && (
        <button
          type="button"
          onClick={() => setDraft(careTeamHandoff)}
          className="border-t border-navy-20 px-4 py-2 text-center text-label text-navy-60 hover:text-navy"
        >
          Clinical question? Hand it to her care team
        </button>
      )}

      {/* Composer — Check in and Emoji used to live here as their own
          buttons; Check in moved into the "+" Add sheet below (with the
          attachment sources it now sits alongside) and Emoji was dropped
          entirely in favor of the device keyboard's own emoji key, so
          +/input/Send fit the phone width with room to spare. */}
      {canChat ? (
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
      ) : (
        <div className="border-t border-navy-20 p-4 text-center text-body-sm text-navy-60">
          {relationship.state === 'paused' ? 'Paused — resume above to keep chatting.' : "This thread isn't active right now."}
        </div>
      )}

      {/* Labeled menu — not a bare kebab */}
      <Sheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Conversation">
        <div className="flex flex-col gap-1">
          <MenuRow
            label="What she's going through"
            onClick={() => {
              setMenuOpen(false)
              setProfileOpen(true)
            }}
          />
          {/* Only offered on a live thread — pausing an already-paused or
              already-ended conversation isn't a real choice. Resuming has
              its own primary action on the paused screen itself. */}
          {canChat && <MenuRow label="Pause this conversation" onClick={handleOpenPause} />}
          <MenuRow
            label="Wrap up together"
            onClick={() => {
              setMenuOpen(false)
              navigate(`/pal/graduate/${relationship.id}`)
            }}
          />
          {canReport && <MenuRow label="Report" onClick={handleOpenReport} />}
        </div>
      </Sheet>

      <Sheet isOpen={profileOpen} onClose={() => setProfileOpen(false)} title={member.displayName}>
        <div className="flex flex-col gap-4">
          {request && request.treatments.length > 0 && (
            <div>
              <p className="text-label-bold uppercase text-navy-60">Her treatment</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {request.treatments.map((code) => (
                  <Tag key={code}>
                    {treatmentLabels[code]?.acronym ?? treatmentLabels[code]?.label ?? code}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {request && request.needs.length > 0 && (
            <div>
              <p className="text-label-bold uppercase text-navy-60">What she said would help</p>
              {request.needs.map((need) => (
                <p key={need} className="text-body-sm text-navy-80">
                  · {supportNeedLabels[need]}
                </p>
              ))}
            </div>
          )}
          <div>
            <p className="text-label-bold uppercase text-navy-60">Her first note to you</p>
            <p className="text-body text-navy-80">{relationship.introNote}</p>
          </div>
          {relationship.milestoneSharing.items.length > 0 && (
            <div>
              <p className="text-label-bold uppercase text-navy-60">She&rsquo;s sharing</p>
              <p className="text-body-sm text-navy-80">
                {relationship.milestoneSharing.items.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </Sheet>

      {/* Pause this conversation — a guided step, not an instant toggle: the
          duration is her stated intent, and the supporting copy exists to
          keep this from reading as a decline or an ending. */}
      <Sheet isOpen={pauseOpen} onClose={() => setPauseOpen(false)} title="Pause for">
        <div className="flex flex-col gap-2">
          {pauseDurationOptions.map((option) => {
            const selected = pauseDuration === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setPauseDuration(option.key)}
                aria-pressed={selected}
                className={`flex min-h-11 items-center rounded-field border px-4 text-body-sm-bold transition-colors ${
                  selected ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white text-navy hover:border-navy-40'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-body-sm text-navy-60">
          Your connection stays in place. {member.displayName} will know you&rsquo;re taking a short
          break, and only you can resume the conversation.
        </p>
        <div className="mt-4">
          <Button variant="primary" disabled={!pauseDuration} onClick={handleConfirmPause}>
            Pause conversation
          </Button>
        </div>
      </Sheet>

      {/* Report — a safety ending, not a request to look into things while
          the match stays open. Same two-step shape as the member's
          Chat.tsx: a reason, then a confirmation that says nothing about
          review status — just that the match is closed and where she goes
          next. She's never asked to explain anything to him. */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report">
        {!reportSubmitted ? (
          <>
            <p className="mb-4 text-body-sm text-navy-60">
              {member.displayName} won&rsquo;t know you reported her. This will end your conversation
              right away.
            </p>
            <p className="mb-2 text-label-bold uppercase text-navy-60">What happened?</p>
            <div className="mb-4 flex flex-col gap-2">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-body-sm text-navy-80">
                  <input
                    type="radio"
                    name="report-reason"
                    className="h-4 w-4"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>
            <TextArea
              label="Anything else you want us to know? (optional)"
              rows={3}
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Optional"
            />
            <div className="mt-4">
              <Button variant="destructive" disabled={!reportReason} onClick={handleSubmitReport}>
                Submit report
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-h3">Thanks for telling us</p>
              <p className="mt-1 text-body-sm text-navy-60">
                This conversation is now closed. We&rsquo;ll take it from here.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setReportOpen(false)
                navigate('/pal/home')
              }}
            >
              Back to Pal Home
            </Button>
          </div>
        )}
      </Modal>

      <AttachSheet
        isOpen={attachOpen}
        onClose={() => setAttachOpen(false)}
        onAttach={setPendingAttachment}
        onCheckIn={handleCheckIn}
      />

      <Toast message={toast} isOpen={!!toast} />
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
