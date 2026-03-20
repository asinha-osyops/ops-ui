/**
 * Design system constants and configuration values
 */

// Layout & Spacing
export const LAYOUT = {
  // Hero section dimensions
  HERO_BUTTON_TO_CURVE_PADDING: 96, // px - spacing from button to curve bottom
  HERO_MIN_CURVE_HEIGHT: 200, // px - minimum curve height for aesthetics

  // Features section line heights
  FEATURES_FIRST_LINE_HEIGHT: 44, // px - extended to overlap hero
  FEATURES_LINE_BETWEEN_HEIGHT: 200, // px - spacing between feature rows
} as const

// Form Options
export const FORM_OPTIONS = {
  HEAR_ABOUT_US: [
    'Search Engine',
    'Social Media',
    'Referral from a colleague',
    'Industry event or conference',
    'LinkedIn',
    'Other',
  ],
} as const

// Brand Colors (for SVG elements that can't use CSS variables)
export const BRAND_COLORS = {
  ORANGE_ACCENT: '#E96443',
} as const
