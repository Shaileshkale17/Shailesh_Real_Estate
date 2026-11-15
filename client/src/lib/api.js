const BASE = import.meta.env.VITE_API_URL || '/api';
/** Default: a real property-tour clip (Pexels, free to hotlink). Override with VITE_HERO_VIDEO at build time. */
const DEFAULT_HERO_VIDEO = 'https://videos.pexels.com/video-files/7578117/7578117-hd_1920_1080_30fps.mp4';
const DEFAULT_HERO_POSTER = 'https://images.pexels.com/videos/7578117/free-video-7578117.jpg?auto=compress&cs=tinysrgb&w=1920';
/** An explicitly empty VITE_HERO_VIDEO ("") disables the video (used in tests / opt-out builds). */
export const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO !== undefined ? import.meta.env.VITE_HERO_VIDEO : DEFAULT_HERO_VIDEO;
export const HERO_POSTER = import.meta.env.VITE_HERO_POSTER || DEFAULT_HERO_POSTER;

export async function api(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status, fields: body.errors });
  return body;
}
