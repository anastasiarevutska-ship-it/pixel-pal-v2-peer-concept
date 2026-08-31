/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Colors, font sizes, shadows, and radii are fully replaced (not
    // extended) with the Pixel Pal design-system tokens from spec §3.
    // This is deliberate: it makes every non-token value (default Tailwind
    // reds/blues, default rounded-lg, default shadow-md, etc.) unavailable,
    // so arbitrary values can't quietly creep back in later.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      navy: {
        DEFAULT: '#070F3F',
        80: '#383F65',
        60: '#6A6F8C',
        40: '#9C9FB2',
        20: '#CDCFD9',
      },
      lavender: {
        DEFAULT: '#C4A6F6',
        80: '#D0B8F8',
        40: '#E7DBFB',
        20: '#F3EDFD',
      },
      coral: '#FFA07E',
      yellow: {
        80: '#FDE9AA',
        40: '#FEF4D5',
      },
      white: '#FFFFFF',
      gray20: '#F9F8F8',
      neutral: {
        900: '#101840',
        700: '#40455A',
        500: '#9095AA',
      },
    },
    fontSize: {
      // name: [size, { lineHeight, letterSpacing, fontWeight }]
      display: ['44px', { lineHeight: '1', letterSpacing: '0px', fontWeight: '500' }],
      h3: ['22px', { lineHeight: '1.2', letterSpacing: '0px', fontWeight: '700' }],
      h4: ['22px', { lineHeight: '1.2', letterSpacing: '0px', fontWeight: '400' }],
      // Corrected from §3's hand-extraction (1.1/1px) — the real Figma H5
      // style (Contact screen eyebrow) is lineHeight 22px, letterSpacing 3px.
      h5: ['16px', { lineHeight: '22px', letterSpacing: '3px', fontWeight: '700' }],
      body: ['16px', { lineHeight: '1.5', letterSpacing: '0px', fontWeight: '400' }],
      'body-bold': ['16px', { lineHeight: '1.5', letterSpacing: '0px', fontWeight: '700' }],
      'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '0px', fontWeight: '400' }],
      'body-sm-bold': ['13px', { lineHeight: '1.5', letterSpacing: '0px', fontWeight: '700' }],
      caption: ['11px', { lineHeight: '1', letterSpacing: '1px', fontWeight: '700' }],
      label: ['10px', { lineHeight: '1.3', letterSpacing: '1px', fontWeight: '400' }],
      'label-bold': ['10px', { lineHeight: '1.3', letterSpacing: '1px', fontWeight: '700' }],
      // Found on the real Home screen (Figma) — sizes not in the original
      // §3 table (which was a curated extraction, not the full system).
      // Named, not arbitrary, same as everything else.
      'card-title': ['28px', { lineHeight: '38px', letterSpacing: '0px', fontWeight: '700' }],
      'nav-label': ['12px', { lineHeight: '1.3', letterSpacing: '0.24px', fontWeight: '400' }],
      'nav-label-active': ['12px', { lineHeight: '1.3', letterSpacing: '0.24px', fontWeight: '500' }],
      // Sub-page screen title (e.g. "Medication Inventory", "Prescriptions")
      // — back-button-then-title pattern seen across the app's drill-down
      // screens. ESTIMATED from screenshots (nodes 5399:25923, 2287:126717)
      // since the Figma connector isn't authorized in this session — unlike
      // every other token in this file, this one has not been checked
      // against the real file. Correct it if that ever changes.
      'screen-title': ['32px', { lineHeight: '1.2', letterSpacing: '0px', fontWeight: '500' }],
    },
    boxShadow: {
      none: 'none',
      // Glass card — signature surface on home/hero cards. Pair with
      // `backdrop-blur-glass` and `border border-white/60`.
      glass: '-10px 10px 20px rgba(7,15,63,0.05)',
      // Standard card shadow.
      card: '-4px 4px 12px rgba(7,15,63,0.08)',
      // Subtle lift.
      xs: '0 1px 2px rgba(16,24,40,0.05)',
    },
    borderRadius: {
      none: '0px',
      card: '16px',
      field: '12px', // inputs & chips
      icon: '8px', // small icon-button containers (found on real Home screen)
      pill: '9999px', // pills & avatars
      // Device-chrome tokens for PhoneFrame (§8) — not part of the spec §3
      // design-system scale, but named for the same reason: no arbitrary
      // corner-radius values in the component itself.
      frame: '52px', // outer bezel
      screen: '40px', // inner screen corners
    },
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        // Corrected from 60px to the real Home screen's actual Figma value.
        glass: '30px',
      },
      backgroundImage: {
        // "Glass Morphism Fill" — the real gradient behind glass cards, not
        // a flat translucent white. Diagonal, top-left brighter.
        'glass-fill': 'linear-gradient(162deg, rgba(255,255,255,0.8) 9%, rgba(255,255,255,0.2) 90%)',
      },
    },
  },
  plugins: [],
}
