import 'dotenv/config';

export const PORT = process.env.PORT || 3000;

export const YT_DLP_FORMAT =
  'bestaudio[ext=m4a][acodec!=none]/bestaudio[acodec!=none]';
export const YT_DLP_TIMEOUT_MS = 60_000;
export const AUDIO_TTL_MS = 15 * 60 * 1000;
export const MAX_AUDIO_CACHE_DOCS = 100;
export const MAX_RECENTLY_PLAYED = 20;
export const MAX_PLAYLIST_ITEMS = 30;
export const USER_SEARCH_LIMIT = 50;