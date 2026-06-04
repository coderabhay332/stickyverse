/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './*.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    { pattern: /./ }, // Include all classes
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-container": "#ede0ff",
        "secondary-fixed-dim": "#ffb0cd",
        "on-surface-variant": "#ccc3d8",
        "inverse-surface": "#e8dfee",
        "outline": "#958da1",
        "surface-container-highest": "#37333e",
        "on-secondary": "#640039",
        "on-error-container": "#ffdad6",
        "surface-bright": "#3c3742",
        "surface-tint": "#d2bbff",
        "on-error": "#690005",
        "on-primary-fixed-variant": "#5a00c6",
        "surface-container-low": "#1d1a24",
        "on-primary": "#3f008e",
        "surface": "#15121b",
        "error-container": "#93000a",
        "primary-fixed": "#eaddff",
        "surface-container-high": "#2c2833",
        "on-secondary-container": "#ffbad3",
        "tertiary": "#ffb784",
        "on-secondary-fixed-variant": "#8c0053",
        "on-secondary-fixed": "#3e0022",
        "secondary-fixed": "#ffd9e4",
        "surface-container-lowest": "#100d16",
        "tertiary-container": "#a15100",
        "on-tertiary-fixed-variant": "#713700",
        "inverse-on-surface": "#332f39",
        "on-primary-fixed": "#25005a",
        "outline-variant": "#4a4455",
        "secondary-container": "#aa0266",
        "tertiary-fixed-dim": "#ffb784",
        "on-surface": "#e8dfee",
        "primary-fixed-dim": "#d2bbff",
        "secondary": "#ffb0cd",
        "on-tertiary-container": "#ffe0cd",
        "surface-container": "#221e28",
        "error": "#ffb4ab",
        "on-background": "#e8dfee",
        "background": "#0C0A1E",
        "primary-container": "#7c3aed",
        "on-tertiary-fixed": "#301400",
        "surface-variant": "#37333e",
        "surface-dim": "#15121b",
        "on-tertiary": "#4f2500",
        "inverse-primary": "#732ee4",
        "primary": "#d2bbff",
        "tertiary-fixed": "#ffdcc6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "unit": "4px",
        "sidebar-width": "200px",
        "margin-desktop": "40px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "headline-lg": ["Syne", "sans-serif"],
        "mono-ui": ["Geist Mono", "monospace"],
        "headline-lg-mobile": ["Syne", "sans-serif"],
        "note-content": ["Caveat", "cursive"],
        "display-xl": ["Syne", "sans-serif"],
        "label-sm": ["DM Sans", "sans-serif"],
        "body-md": ["DM Sans", "sans-serif"],
        sans: ["DM Sans", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "mono-ui": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "note-content": ["20px", { "lineHeight": "1.4", "fontWeight": "400" }],
        "display-xl": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "label-sm": ["13px", { "lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "500" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
}
