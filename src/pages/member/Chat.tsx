import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { QuietThreadNotice } from '../../components/QuietThreadNotice'
import { AttachSheet } from '../../components/AttachSheet'
import { AttachmentBubble, PendingAttachmentChip } from '../../components/MessageAttachmentViews'
import { TextArea } from '../../components/ui/TextArea'
import { useDemoStore } from '../../store/useDemoStore'
import { lowerFirst, replyTimeframeLabel } from '../../lib/replyTimeframes'
import { reportReasons } from '../../lib/reportReasons'
import type { MessageAttachment } from '../../lib/types'

const milestoneStages = ['Starting stims', 'Egg retrieval', 'Transfer', 'Two-week wait', 'Test day']

const statusCopy: Partial<Record<string, string>> = {
  archived: 'This conversation has ended. It stays here so you can look back on it.',
  graduated: 'You graduated together. This conversation stays here so you can look back on it.',
}

/**
 * M7 Connected + M8 Chat combined (spec §7) — the shared-context banner,
 * inline guidelines line, and intro note doing the M7 "connected" framing
 * live at the top of the same screen as the ongoing M8 conversation, since
 * spec describes them as the thread's opening state rather than a separate
 * screen. No read receipts, no last-seen (spec §10/§D13).
 */
export default function Chat() {
  const { relationshipId = '' } = useParams()
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const relationship = useDemoStore((s) => s.relationships[relationshipId])
  const pal = useDemoStore((s) => s.people[relationship?.palId ?? ''])
  const palProfile = useDemoStore((s) => s.palProfiles[relationship?.palId ?? ''])
  const sendMessage = useDemoStore((s) => s.sendMessage)
  const findSomeoneElse = useDemoStore((s) => s.findSomeoneElse)
  const setMilestoneSharing = useDemoStore((s) => s.setMilestoneSharing)
  const reportRelationship = useDemoStore((s) => s.reportRelationship)
  const lastOutcome = useDemoStore((s) => s.memberFlow.lastOutcome)
  const acknowledgeOutcome = useDemoStore((s) => s.acknowledgeOutcome)

  const [draft, setDraft] = useState('')
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const [reportNote, setReportNote] = useState('')
  const [findSomeoneElseOpen, setFindSomeoneElseOpen] = useState(false)
  const [toast, setToast] = useState('')

  // She's reached the conversation an unseen "accepted" outcome was
  // pointing at — clears the Messages-tab dot and the Pixel Pal card's
  // "Continue chatting" copy back to normal. Guarded to this relationship
  // specifically, not any chat screen, so opening some other thread
  // doesn't accidentally dismiss it.
  useEffect(() => {
    if (relationship && lastOutcome?.type === 'accepted' && lastOutcome.relationshipId === relationship.id && !lastOutcome.seenAt) {
      acknowledgeOutcome()
    }
  }, [relationship, lastOutcome, acknowledgeOutcome])

  if (!relationship || !pal || !palProfile) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-body text-navy-60">Conversation not found.</p>
      </div>
    )
  }

  const canChat = relationship.state === 'active' || relationship.state === 'quiet'
  // Report only makes sense on a real, still-live conversation — not one
  // already ended (nothing left to end) and not a still-`pending` note
  // (there's no exchange yet to have gone wrong).
  const canReport = ['active', 'quiet', 'paused'].includes(relationship.state)

  // Back goes to wherever this thread is actually listed, rather than
  // navigate(-1): ongoing threads are surfaced on Contacts ("Continue
  // chatting"), everything else lives in Past conversations. Same split
  // ContactsEntry and PastConversations already use, so the two can't
  // disagree — and unlike history-back it still works on a deep link,
  // which is exactly how this screen gets opened during a demo.
  const backTo = ['pending', 'active', 'quiet'].includes(relationship.state) ? '/m' : '/m/past'

  function flashToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

  function handleSend() {
    if (!draft.trim() && !pendingAttachment) return
    sendMessage(relationship.id, memberId, draft.trim(), 'text', pendingAttachment ?? undefined)
    setDraft('')
    setPendingAttachment(null)
  }

  function handleCheckIn() {
    sendMessage(relationship.id, memberId, 'Thinking of you today.', 'checkin')
    // Every other action here confirms (Pause, Withdraw) — check-in was the
    // one silent exception, with only a small pill dropped into the thread
    // above as any sign it worked. Easy to miss, especially since your eyes
    // are on the composer, not scrolled up to the message list.
    flashToast('Check-in sent.')
  }

  function handleFindSomeoneElse() {
    findSomeoneElse(memberId, relationship.id)
    setFindSomeoneElseOpen(false)
    navigate('/m/suggestions')
  }

  function handleOpenReport() {
    setMenuOpen(false)
    setReportReason(null)
    setReportNote('')
    setReportSubmitted(false)
    setReportOpen(true)
  }

  // Report ends the match on submit — not a request to look into things
  // while it stays open. `findSomeoneElse` is left untouched here on
  // purpose: this isn't that flow, it's the one below it that also frees
  // her to rematch, just for a different, more serious reason.
  function handleSubmitReport() {
    if (!reportReason) return
    reportRelationship(relationship.id, memberId, reportReason, reportNote.trim() || undefined)
    setReportSubmitted(true)
  }

  function handleFindAnotherPal() {
    setReportOpen(false)
    navigate('/m/suggestions')
  }

  function toggleMilestone(stage: string) {
    const items = relationship.milestoneSharing.items.includes(stage)
      ? relationship.milestoneSharing.items.filter((s) => s !== stage)
      : [...relationship.milestoneSharing.items, stage]
    setMilestoneSharing(relationship.id, items.length > 0, items)
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-navy-20 p-4">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-h4 text-navy"
        >
          ←
        </button>
        <Avatar name={pal.displayName} src={pal.avatarUrl} size="sm" />
        <div className="flex-1">
          <p className="text-body-bold">{pal.displayName}</p>
          <p className="text-label text-navy-60">
            Usually replies {lowerFirst(replyTimeframeLabel(palProfile.typicalReplyHours))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 items-center gap-1 rounded-field px-3 text-body-sm-bold text-navy hover:bg-lavender-20"
        >
          Menu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Shared context + guidelines line (M7) */}
        <div className="mb-4 rounded-field bg-lavender-20 px-3 py-2 text-center text-body-sm text-navy-80">
          {relationship.sharedContext}
        </div>
        <p className="mb-4 text-center text-label text-navy-60">
          By chatting you agree to our{' '}
          <button type="button" className="underline" onClick={() => flashToast('Community guidelines — link stub.')}>
            community guidelines
          </button>
          .
        </p>

        {statusCopy[relationship.state] && (
          <div className="mb-4 rounded-field bg-yellow-40 px-3 py-2 text-center text-body-sm text-navy-80">
            {statusCopy[relationship.state]}
          </div>
        )}

        {/* Only the Pal can pause or resume — the member just sees where
            things stand, in language that can't read as rejection, an
            ending, or anything she did. No resume action here; there's
            nothing for her to do but wait. */}
        {relationship.state === 'paused' && (
          <div className="mb-4 rounded-card bg-yellow-40 p-4 text-center">
            <p className="text-body-sm-bold text-navy">{pal.displayName} is taking a short break</p>
            <p className="mt-1 text-body-sm text-navy-80">
              Your conversation is still here. We&rsquo;ll let you know when {pal.displayName} is back.
            </p>
          </div>
        )}

        {/* `quiet` has no statusCopy entry — it's the one state that's still
            live, so it gets an open door rather than a status label. */}
        {relationship.state === 'quiet' && (
          <QuietThreadNotice otherName={pal.displayName} lastMessageAt={relationship.lastMessageAt} />
        )}

        {/* Messages */}
        <div className="flex flex-col gap-3">
          {relationship.messages.map((message) => {
            if (message.kind === 'checkin') {
              const senderName = message.senderId === memberId ? 'You' : pal.displayName
              return (
                <div key={message.id} className="mx-auto rounded-pill bg-lavender-20 px-4 py-1.5 text-body-sm text-navy-80">
                  {senderName === 'You' ? 'You sent a check-in' : `${senderName} is thinking of you`}
                </div>
              )
            }
            const isMe = message.senderId === memberId
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
      </div>

      {/* Quiet, persistent clinical-boundary affordance */}
      <button
        type="button"
        onClick={() => navigate('/m')}
        className="border-t border-navy-20 px-4 py-2 text-center text-label text-navy-60 hover:text-navy"
      >
        Need a nurse? Talk to your Care Coordinator
      </button>

      {/* Composer — Check in and Emoji used to live here as their own
          buttons; Check in moved into the "+" Add sheet below (with the
          attachment sources it now sits alongside) and Emoji was dropped
          entirely in favor of the device keyboard's own emoji key, so
          +/input/Send fit the 366px screen with room to spare. */}
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
          {relationship.state === 'pending'
            ? 'Waiting for a reply.'
            : relationship.state === 'paused'
              ? 'This conversation is paused right now.'
              : "This thread isn't active right now."}
        </div>
      )}

      {/* Labeled menu — not a bare kebab */}
      <Sheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Conversation">
        <div className="flex flex-col gap-1">
          <MenuRow
            label="View profile"
            onClick={() => {
              setMenuOpen(false)
              setProfileOpen(true)
            }}
          />
          <MenuRow
            label="Milestone sharing"
            onClick={() => {
              setMenuOpen(false)
              setMilestoneOpen(true)
            }}
          />
          {/* No "Pause" here — pausing is only ever the Pal's call
              (PalChat's "Pause this conversation"); this side just sees the
              result. */}
          <MenuRow
            label="Find someone else"
            onClick={() => {
              setMenuOpen(false)
              setFindSomeoneElseOpen(true)
            }}
          />
          <MenuRow
            label="Graduate"
            onClick={() => {
              setMenuOpen(false)
              navigate(`/m/graduate/${relationship.id}`)
            }}
          />
          {canReport && <MenuRow label="Report" onClick={handleOpenReport} />}
        </div>
      </Sheet>

      {/* View profile */}
      <Sheet isOpen={profileOpen} onClose={() => setProfileOpen(false)} title={pal.displayName}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-label-bold text-navy-60">WHERE SHE WAS</p>
            <p className="text-body text-navy-80">{palProfile.story.whereIWas}</p>
          </div>
          <div>
            <p className="text-label-bold text-navy-60">WHAT HELPED HER</p>
            <p className="text-body text-navy-80">{palProfile.story.whatHelpedMe}</p>
          </div>
          <div>
            <p className="text-label-bold text-navy-60">WHAT SHE CAN OFFER</p>
            <p className="text-body text-navy-80">{palProfile.story.whatICanOffer}</p>
          </div>
        </div>
      </Sheet>

      {/* Milestone sharing — opt-in per item, revocable, stage labels only */}
      <Sheet isOpen={milestoneOpen} onClose={() => setMilestoneOpen(false)} title="Milestone sharing">
        <p className="mb-4 text-body-sm text-navy-60">
          Choose what {pal.displayName} can see. Nothing clinical — just the stage, and only what you opt into.
        </p>
        <div className="flex flex-col gap-2">
          {milestoneStages.map((stage) => {
            const shared = relationship.milestoneSharing.items.includes(stage)
            return (
              <button
                key={stage}
                type="button"
                onClick={() => toggleMilestone(stage)}
                className={`flex min-h-11 items-center justify-between rounded-field border px-4 text-body-sm-bold transition-colors ${
                  shared ? 'border-navy bg-navy text-white' : 'border-navy-20 bg-white text-navy'
                }`}
              >
                <span>{stage}</span>
                <span>{shared ? 'Sharing' : 'Off'}</span>
              </button>
            )
          })}
        </div>
      </Sheet>

      {/* Report — a safety ending, not a request to look into things while
          the match stays open (rare in production, per spec §12, but no
          longer a stub: submitting it here really does close the
          conversation). Two steps in the same modal: pick a reason, then a
          confirmation that never mentions review status — she's told the
          match is closed and where to go next, nothing about what happens
          to the report from here. */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report">
        {!reportSubmitted ? (
          <>
            <p className="mb-4 text-body-sm text-navy-60">
              {pal.displayName} won&rsquo;t know you reported her. This will end your conversation right
              away.
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
                This conversation is now closed. You can choose another Pixel Pal whenever you&rsquo;re
                ready.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={handleFindAnotherPal}>
                Find another Pal
              </Button>
              <Button variant="ghost" onClick={() => setReportOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Find someone else — confirmation */}
      <Modal isOpen={findSomeoneElseOpen} onClose={() => setFindSomeoneElseOpen(false)} title="Find someone new?">
        <p className="mb-4 text-body-sm text-navy-60">
          This conversation with {pal.displayName} will be archived and still readable — she won&rsquo;t be told
          why.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleFindSomeoneElse}>
            Find someone new
          </Button>
          <Button variant="ghost" onClick={() => setFindSomeoneElseOpen(false)}>
            Cancel
          </Button>
        </div>
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
