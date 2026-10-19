import type { VideoProvider } from '../../../types/database.types';

/**
 * Extract YouTube ID from any YouTube URL format (watch?v=, youtu.be, shorts, embed)
 */
export const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const pathId = parsed.pathname.replace(/^\//, '');
      if (pathId.length === 11) return pathId;
    }
  } catch {}
  return null;
};

/**
 * Extract Vimeo ID from standard Vimeo URLs
 */
export const getVimeoId = (url: string): string | null => {
  if (!url) return null;
  const match = url.trim().match(/(?:vimeo\.com\/)(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
};

/**
 * Extract Google Drive file ID
 */
export const getGoogleDriveId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
};

/**
 * Auto-detect video provider from URL
 */
export const detectVideoProvider = (url: string): VideoProvider | null => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim().toLowerCase();

  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return 'youtube';
  }
  if (trimmed.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (trimmed.includes('drive.google.com')) {
    return 'drive';
  }
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.mov') || trimmed.includes('/storage/v1/object/public/')) {
    return 'direct';
  }
  return null;
};

/**
 * Generate standard high-quality YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Auto-derive thumbnail from URL and provider if possible
 */
export const deriveThumbnail = (url: string, provider: VideoProvider): string | null => {
  if (provider === 'youtube') {
    const ytId = getYouTubeId(url);
    if (ytId) {
      return getYouTubeThumbnail(ytId);
    }
  }
  return null;
};
