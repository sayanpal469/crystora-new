// Public site origin — used for canonical URLs, sitemap, JSON-LD and metadataBase.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://crystaura.co.in').replace(/\/$/, '');

export const SITE_NAME = 'Crystaura';

// Backend API base used by the browser.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://mediumvioletred-tapir-806119.hostingersite.com/api'
    : 'http://localhost:8000/api')
).replace(/\/$/, '');

// Backend API base used during server rendering. Can point at an internal address
// (e.g. http://127.0.0.1:8000/api on the same box) to skip the public round trip.
export const SERVER_API_BASE_URL = (process.env.API_BASE_URL || API_BASE_URL).replace(/\/$/, '');

export const DEFAULT_TITLE = 'Crystaura — Sacred Spiritual Products';
export const DEFAULT_DESCRIPTION =
  'Discover authentic spiritual products — crystals, rudraksha, yantras, and sacred items energized with Vedic rituals.';

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '966376123062272';
export const GOOGLE_SITE_VERIFICATION = 'gCyBGpp0-fgdQrdPYLvmbQBrX9YU_hts-rfE_dVnOws';
