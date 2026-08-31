import type { MessageAttachment } from '../lib/types'

/** Renders an attachment inside a sent message bubble — image thumbnail, or
 * a filename chip for documents (this prototype has no document viewer). */
export function AttachmentBubble({ attachment }: { attachment: MessageAttachment }) {
  if (attachment.type === 'image') {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        className="mb-2 max-h-48 w-full rounded-field object-cover"
      />
    )
  }
  return (
    <div className="mb-2 flex items-center gap-2 rounded-field bg-lavender-20 px-3 py-2 text-body-sm text-navy">
      <span aria-hidden="true">📄</span>
      <span className="min-w-0 truncate">{attachment.name}</span>
    </div>
  )
}

/** The "about to send" chip shown above the composer once a file's picked —
 * lets her see (and undo) the attachment before it goes out, since sending
 * is otherwise a one-way door. */
export function PendingAttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: MessageAttachment
  onRemove: () => void
}) {
  return (
    <div className="mx-3 mb-2 flex items-center gap-2 rounded-field border border-navy-20 bg-white px-3 py-2">
      {attachment.type === 'image' ? (
        <img src={attachment.url} alt={attachment.name} className="h-10 w-10 rounded-field object-cover" />
      ) : (
        <span aria-hidden="true" className="text-h4">
          📄
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-body-sm text-navy-80">{attachment.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-navy-60 hover:bg-lavender-20"
      >
        ✕
      </button>
    </div>
  )
}
