import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { TextArea } from '../../components/ui/TextArea'
import { Sheet } from '../../components/ui/Sheet'
import { useDemoStore } from '../../store/useDemoStore'

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// Same data-URL read `AttachSheet` uses for a picked image — duplicated
// rather than imported since it's a private helper there, not shared.
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Small camera badge for the avatar's edit affordance — inline SVG, same
// pattern as `ScreenHeader`'s back-chevron (no icon library dependency).
function CameraIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  )
}

/**
 * Edit Social Profile — reached from `SocialProfilePreview`'s "Edit social
 * profile". This is the same Social Profile the preview shows ("This is how
 * your Pixel Pal will see you"), not a separate Pixel Pal profile — see
 * docs/pixel-pal-v2-source-of-truth.md "Social Profile". It edits the same
 * `people[currentMemberId]` record the preview reads, with the same fields
 * (name/alias, signature, about me, social links) the Main App's Social
 * Profile already has — no Pixel-Pal-only fields, no treatment, location,
 * or matching-preference data here.
 *
 * Group membership is deliberately not editable here — it's managed by the
 * separate Groups/Community feature, not this profile.
 *
 * Follows the visual pattern of the app's other edit screens (`PalEdit`:
 * `ScreenHeader` + labeled inputs + a primary action) rather than inventing
 * new form components.
 *
 * Draft is local `useState`, seeded from the store once on mount, and only
 * written back via `updateSocialProfile` on "Save Changes" — Back/Cancel
 * navigate away without ever calling it, so unsaved edits are discarded.
 *
 * The avatar is editable the same way: tapping it (or its camera badge)
 * opens a small `Sheet` — "Choose from photo library" / "Remove photo"
 * (only when a photo is currently set) / "Cancel" — reusing `AttachSheet`'s
 * picker pattern (a `Sheet` plus an off-screen `<input type="file">`, read
 * via `FileReader` into a data URL) rather than inventing a new one. No
 * camera capture, per prototype scope. The picked/removed image is draft
 * state like everything else here — only `avatarUrl` in the `Save Changes`
 * patch commits it.
 */
export default function SocialProfileEdit() {
  const navigate = useNavigate()
  const memberId = useDemoStore((s) => s.currentMemberId)
  const member = useDemoStore((s) => s.people[memberId])
  const updateSocialProfile = useDemoStore((s) => s.updateSocialProfile)

  const [displayName, setDisplayName] = useState(member?.displayName ?? '')
  const [signature, setSignature] = useState(member?.signature ?? '')
  const [aboutMe, setAboutMe] = useState(member?.aboutMe ?? '')
  const [socialLinks, setSocialLinks] = useState((member?.socialLinks ?? []).join('\n'))
  const [avatarUrl, setAvatarUrl] = useState(member?.avatarUrl ?? '')
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const goToPreview = () => navigate('/m/social-profile-preview')

  const handleSave = () => {
    updateSocialProfile({
      displayName: displayName.trim() || member?.displayName || '',
      signature: signature.trim(),
      aboutMe: aboutMe.trim(),
      socialLinks: linesToList(socialLinks),
      avatarUrl,
    })
    goToPreview()
  }

  async function handlePhotoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again next time
    if (!file) return
    setAvatarUrl(await readAsDataUrl(file))
    setAvatarSheetOpen(false)
  }

  function handleRemovePhoto() {
    setAvatarUrl('')
    setAvatarSheetOpen(false)
  }

  return (
    // No `relative` here on purpose: this root grows taller than the device
    // viewport (it scrolls inside `PhoneFrame`'s `flex-1 overflow-y-auto`),
    // so it must NOT become the positioned ancestor for `Sheet`'s
    // `absolute inset-0` below — that would anchor the sheet to this tall,
    // scrolling content box instead of the actual visible screen. Falling
    // through to `PhoneFrame`'s own `relative overflow-hidden` device-screen
    // div (which stays exactly viewport-sized) is what keeps the sheet
    // pinned to the real bottom edge.
    <div className="flex min-h-full flex-col gap-6 p-5">
      <ScreenHeader title="Edit Social Profile" onBack={goToPreview} />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAvatarSheetOpen(true)}
            aria-label="Change photo"
            className="block rounded-pill"
          >
            <Avatar name={displayName || member?.displayName || ''} src={avatarUrl || undefined} size="xl" />
          </button>
          <button
            type="button"
            onClick={() => setAvatarSheetOpen(true)}
            aria-label="Change photo"
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-pill border-2 border-white bg-lavender-40 text-navy shadow-card"
          >
            <CameraIcon />
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <TextField
          label={"Your Name or Alias".toUpperCase()}
          name="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label={"Your Signature".toUpperCase()}
          name="signature"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          helperText="A short line shown near your name."
        />
        <TextArea
          label={"About Me".toUpperCase()}
          name="aboutMe"
          rows={3}
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />
        <TextArea
          label={"Social Links".toUpperCase()}
          name="socialLinks"
          rows={2}
          value={socialLinks}
          onChange={(e) => setSocialLinks(e.target.value)}
          helperText="One per line."
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="ghost" onClick={goToPreview}>
          Cancel
        </Button>
      </div>

      <Sheet isOpen={avatarSheetOpen} onClose={() => setAvatarSheetOpen(false)} title="Profile photo">
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => photoInputRef.current?.click()}>
            Choose from photo library
          </Button>
          {avatarUrl && (
            <Button variant="secondary" onClick={handleRemovePhoto}>
              Remove photo
            </Button>
          )}
          <Button variant="ghost" onClick={() => setAvatarSheetOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoPicked}
      />
    </div>
  )
}
