import { useRef } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import type { MessageAttachment } from '../lib/types'

type AttachSheetProps = {
  isOpen: boolean
  onClose: () => void
  onAttach: (attachment: MessageAttachment) => void
  onCheckIn: () => void
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * "Add" sheet shared by both chat composers (member + Pal) — everything
 * that used to be its own dedicated composer button (Check in) or its own
 * sheet lives here now, freeing the composer row down to +/input/Send so it
 * fits without crowding. Attachments mirror the shared `sendMessage` action
 * underneath — same three sources (camera, gallery, document) as the
 * mockup. The actual file pickers are native `<input type="file">`s kept
 * off-screen; the sheet just triggers them, since a styled button can't
 * open a file dialog on its own.
 */
export function AttachSheet({ isOpen, onClose, onAttach, onCheckIn }: AttachSheetProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  async function handlePicked(e: React.ChangeEvent<HTMLInputElement>, type: MessageAttachment['type']) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again next time
    if (!file) return
    const url = type === 'image' ? await readAsDataUrl(file) : ''
    onAttach({ type, name: file.name, url })
    onClose()
  }

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose} title="Add">
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              onCheckIn()
              onClose()
            }}
          >
            Send a check-in
          </Button>
          <Button variant="secondary" onClick={() => cameraInputRef.current?.click()}>
            Image from Camera
          </Button>
          <Button variant="secondary" onClick={() => galleryInputRef.current?.click()}>
            Image from Gallery
          </Button>
          <Button variant="secondary" onClick={() => documentInputRef.current?.click()}>
            Document
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Sheet>

      {/* Off-screen native pickers — `capture` nudges mobile browsers to
          open the camera directly instead of the gallery. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handlePicked(e, 'image')}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePicked(e, 'image')}
      />
      <input
        ref={documentInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handlePicked(e, 'document')}
      />
    </>
  )
}
