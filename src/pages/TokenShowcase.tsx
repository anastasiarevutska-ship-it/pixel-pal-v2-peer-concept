import { motion, useReducedMotion } from 'framer-motion'

/**
 * Throwaway page — not product UI.
 *
 * Renders every design token from spec §3 (colour, type, effects, shape) as
 * a named Tailwind class, so they can be eyeballed before Phase 1 screens
 * get built on top of them. Delete this page once the tokens are approved.
 */

type ColorToken = { name: string; swatch: string; hex: string }
type ColorGroup = { title: string; tokens: ColorToken[] }

const colorGroups: ColorGroup[] = [
  {
    title: 'Navy — primary text & buttons',
    tokens: [
      { name: 'navy', swatch: 'bg-navy', hex: '#070F3F' },
      { name: 'navy-80', swatch: 'bg-navy-80', hex: '#383F65' },
      { name: 'navy-60', swatch: 'bg-navy-60', hex: '#6A6F8C' },
      { name: 'navy-40', swatch: 'bg-navy-40', hex: '#9C9FB2' },
      { name: 'navy-20', swatch: 'bg-navy-20', hex: '#CDCFD9' },
    ],
  },
  {
    title: 'Lavender — brand accent',
    tokens: [
      { name: 'lavender', swatch: 'bg-lavender', hex: '#C4A6F6' },
      { name: 'lavender-80', swatch: 'bg-lavender-80', hex: '#D0B8F8' },
      { name: 'lavender-40', swatch: 'bg-lavender-40', hex: '#E7DBFB' },
      { name: 'lavender-20', swatch: 'bg-lavender-20', hex: '#F3EDFD' },
    ],
  },
  {
    title: 'Coral — warm secondary accent (sparingly, never for errors)',
    tokens: [{ name: 'coral', swatch: 'bg-coral', hex: '#FFA07E' }],
  },
  {
    title: 'Yellow — gentle notices',
    tokens: [
      { name: 'yellow-80', swatch: 'bg-yellow-80', hex: '#FDE9AA' },
      { name: 'yellow-40', swatch: 'bg-yellow-40', hex: '#FEF4D5' },
    ],
  },
  {
    title: 'Neutral',
    tokens: [
      { name: 'neutral-900', swatch: 'bg-neutral-900', hex: '#101840' },
      { name: 'neutral-700', swatch: 'bg-neutral-700', hex: '#40455A' },
      { name: 'neutral-500', swatch: 'bg-neutral-500', hex: '#9095AA' },
    ],
  },
  {
    title: 'Base',
    tokens: [
      { name: 'white', swatch: 'bg-white', hex: '#FFFFFF' },
      { name: 'gray20', swatch: 'bg-gray20', hex: '#F9F8F8' },
    ],
  },
]

type TypeSpecimen = {
  token: string
  className: string
  label: string
  spec: string
  sample: string
}

const typeSpecimens: TypeSpecimen[] = [
  { token: 'display', className: 'text-display', label: 'Display', spec: '44 / 500 / 1.0 / 0', sample: 'Find your Pixel Pal' },
  { token: 'h3', className: 'text-h3', label: 'H3', spec: '22 / 700 / 1.2 / 0', sample: 'Your suggestions' },
  { token: 'h4', className: 'text-h4', label: 'H4', spec: '22 / 400 / 1.2 / 0', sample: 'Three people who understand' },
  { token: 'h5', className: 'text-h5', label: 'H5', spec: '16 / 700 / 22px / 3px', sample: 'SUGGESTED FOR YOU' },
  { token: 'body', className: 'text-body', label: 'Body', spec: '16 / 400 / 1.5 / 0', sample: "We'll suggest three people who've been where you are." },
  { token: 'body-bold', className: 'text-body-bold', label: 'Body Bold', spec: '16 / 700 / 1.5 / 0', sample: 'Usually replies within a day' },
  { token: 'body-sm', className: 'text-body-sm', label: 'Body Small', spec: '13 / 400 / 1.5 / 0', sample: 'Two failed IVF cycles before our daughter.' },
  { token: 'body-sm-bold', className: 'text-body-sm-bold', label: 'Body Small Bold', spec: '13 / 700 / 1.5 / 0', sample: 'Also went through two rounds of FET' },
  { token: 'caption', className: 'text-caption', label: 'Captions', spec: '11 / 700 / 1.0 / 1', sample: 'AVAILABLE' },
  { token: 'label', className: 'text-label', label: 'Label', spec: '10 / 400 / 1.3 / 1', sample: 'treatment' },
  { token: 'label-bold', className: 'text-label-bold', label: 'Label Bold', spec: '10 / 700 / 1.3 / 1', sample: 'IVF · FET' },
]

const shadowSamples = [
  {
    name: 'Glass card',
    className: 'shadow-glass backdrop-blur-glass border border-white/60 bg-glass-fill',
    css: 'blur(30px) · border white/60 · -10px 10px 20px rgba(7,15,63,.05)',
  },
  {
    name: 'Small shadow',
    className: 'shadow-card bg-white',
    css: '-4px 4px 12px rgba(7,15,63,.08)',
  },
  {
    name: 'Shadow xs',
    className: 'shadow-xs bg-white',
    css: '0 1px 2px rgba(16,24,40,.05)',
  },
]

const radiusSamples = [
  { name: 'card', className: 'rounded-card', value: '16px' },
  { name: 'field', className: 'rounded-field', value: '12px (inputs/chips)' },
  { name: 'pill', className: 'rounded-pill', value: '999px (pills/avatars)' },
]

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-label-bold text-navy-60 uppercase">{eyebrow}</p>
      <h2 className="text-h3">{title}</h2>
    </div>
  )
}

function ColorSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 w-full rounded-field border border-navy/10 ${token.swatch}`}
        aria-hidden="true"
      />
      <div>
        <p className="text-body-sm-bold">{token.name}</p>
        <p className="text-label text-navy-60">{token.hex}</p>
      </div>
    </div>
  )
}

export default function TokenShowcase() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.main
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-5xl px-5 py-12"
    >
      <header className="mb-16">
        <p className="text-label-bold text-lavender uppercase">Pixel Pal</p>
        <h1 className="text-display">Design tokens</h1>
        <p className="mt-2 max-w-2xl text-body text-navy-60">
          Throwaway page, not product UI — every colour, type style, and
          effect from spec §3, rendered as its named Tailwind token so it can
          be checked before Phase 1 screens get built on top of it.
        </p>
      </header>

      {/* Color */}
      <section className="mb-20">
        <SectionHeading eyebrow="§3 · Color" title="Palette" />
        <div className="flex flex-col gap-10">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-body-sm-bold text-navy-60">{group.title}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {group.tokens.map((token) => (
                  <ColorSwatch key={token.name} token={token} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-20">
        <SectionHeading eyebrow="§3 · Typography" title="Space Grotesk" />
        <div className="flex flex-col divide-y divide-navy-20">
          {typeSpecimens.map((spec) => (
            <div
              key={spec.token}
              className="grid grid-cols-1 items-baseline gap-2 py-5 md:grid-cols-[160px_1fr_auto]"
            >
              <p className="text-label-bold text-lavender uppercase">{spec.label}</p>
              <p className={spec.className}>{spec.sample}</p>
              <p className="text-label text-navy-60 whitespace-nowrap">
                {spec.spec}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Effects */}
      <section className="mb-20">
        <SectionHeading eyebrow="§3 · Effects" title="Shadows" />
        <div className="rounded-card bg-lavender-20 p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {shadowSamples.map((shadow) => (
              <div key={shadow.name} className="flex flex-col gap-3">
                <div
                  className={`flex h-32 items-center justify-center rounded-card ${shadow.className}`}
                >
                  <span className="text-body-sm-bold">{shadow.name}</span>
                </div>
                <p className="text-label text-navy-60">{shadow.css}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shape */}
      <section>
        <SectionHeading eyebrow="§3 · Shape" title="Radius" />
        <div className="flex flex-wrap gap-8">
          {radiusSamples.map((radius) => (
            <div key={radius.name} className="flex flex-col items-center gap-3">
              <div className={`h-20 w-20 bg-lavender-40 ${radius.className}`} />
              <div className="text-center">
                <p className="text-body-sm-bold">{radius.name}</p>
                <p className="text-label text-navy-60">{radius.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.main>
  )
}
