import { useMemo } from 'react';
import type { PlatformId } from '../types';

export type DetectedOS = Extract<PlatformId, 'windows' | 'macos' | 'linux' | 'android'>;

export function useDetectedOS(): { os: DetectedOS; label: string } {
  return useMemo(() => {
    if (typeof navigator === 'undefined') {
      return { os: 'windows', label: 'Windows' };
    }
    const ua = navigator.userAgent.toLowerCase();
    const platform = (
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ||
      navigator.platform ||
      ''
    ).toLowerCase();

    if (ua.includes('android')) {
      return { os: 'android', label: 'Android' };
    }
    if (platform.includes('mac') || ua.includes('mac os') || ua.includes('macintosh')) {
      return { os: 'macos', label: 'macOS' };
    }
    if (platform.includes('linux') || ua.includes('linux')) {
      return { os: 'linux', label: 'Linux' };
    }
    return { os: 'windows', label: 'Windows' };
  }, []);
}
