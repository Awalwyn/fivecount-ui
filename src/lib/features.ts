export const FEATURES = {
  // Phase 1 - Core features (enabled)
  AUTH: true,
  PROFILES: true,
  COMPETITION_RESULTS: true,
  STATS: true,

  // Phase 2+ - Features
  SEARCH: process.env.NEXT_PUBLIC_ENABLE_SEARCH === 'true',
  MESSAGING: process.env.NEXT_PUBLIC_ENABLE_MESSAGING === 'true',
  FOLLOWING: process.env.NEXT_PUBLIC_ENABLE_FOLLOWING === 'true',
  FEED: true, // Enabled - posts feature is built out
} as const;
