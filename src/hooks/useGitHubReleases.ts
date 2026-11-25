import { useEffect, useState } from 'react';
import { siteConfig } from '../data/siteConfig';
import type { DirectDownload, GitHubReleaseAsset, GitHubReleaseInfo } from '../types';

const CACHE_PREFIX = 'tulip_gh_rel_v1_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedEntry {
  timestamp: number;
  data: GitHubReleaseInfo;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useGitHubReleases(repos: string[]) {
  const [releases, setReleases] = useState<Record<string, GitHubReleaseInfo>>({});
  const repoKey = [...new Set(repos.filter(Boolean))].sort().join(',');

  useEffect(() => {
    if (!repoKey) return;
    const uniqueRepos = repoKey.split(',');
    let cancelled = false;

    const loadAll = async () => {
      const results: Record<string, GitHubReleaseInfo> = {};

      await Promise.all(
        uniqueRepos.map(async (repo) => {
          const cacheKey = `${CACHE_PREFIX}${repo}`;
          try {
            const raw = localStorage.getItem(cacheKey);
            if (raw) {
              const parsed = JSON.parse(raw) as CachedEntry;
              if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
                results[repo] = parsed.data;
                return;
              }
            }
          } catch {
            // ignore cache parse errors
          }

          try {
            const res = await fetch(
              `https://api.github.com/repos/${siteConfig.githubOwner}/${repo}/releases/latest`,
              { headers: { Accept: 'application/vnd.github+json' } }
            );
            if (!res.ok) return;
            const json = await res.json();
            const info: GitHubReleaseInfo = {
              tagName: json.tag_name || '',
              name: json.name || json.tag_name || '',
              publishedAt: json.published_at || '',
              htmlUrl: json.html_url || '',
              assets: Array.isArray(json.assets)
                ? json.assets.map((a: GitHubReleaseAsset) => ({
                    name: a.name,
                    size: a.size,
                    browser_download_url: a.browser_download_url,
                    download_count: a.download_count || 0,
                  }))
                : [],
            };
            results[repo] = info;
            try {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({ timestamp: Date.now(), data: info })
              );
            } catch {
              // ignore storage quota errors
            }
          } catch {
            // Silently fall back to static URLs in apps.ts
          }
        })
      );

      if (!cancelled) {
        setReleases(results);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [repoKey]);

  return releases;
}

export function resolveDownload(
  download: DirectDownload,
  releases: Record<string, GitHubReleaseInfo>
): {
  url: string;
  version?: string;
  fileSize?: string;
  fileName?: string;
  isLive: boolean;
} {
  if (!download.githubRepo || !releases[download.githubRepo]) {
    return {
      url: download.url,
      version: download.version,
      fileSize: download.fileSize,
      isLive: false,
    };
  }

  const rel = releases[download.githubRepo];
  let matchedAsset: GitHubReleaseAsset | undefined;

  if (download.assetMatch) {
    try {
      const regex = new RegExp(download.assetMatch, 'i');
      matchedAsset = rel.assets.find((a) => regex.test(a.name));
    } catch {
      matchedAsset = rel.assets[0];
    }
  } else {
    matchedAsset = rel.assets[0];
  }

  if (!matchedAsset) {
    return {
      url: download.url,
      version: rel.tagName || download.version,
      fileSize: download.fileSize,
      isLive: true,
    };
  }

  return {
    url: matchedAsset.browser_download_url,
    version: rel.tagName || download.version,
    fileSize: formatBytes(matchedAsset.size) || download.fileSize,
    fileName: matchedAsset.name,
    isLive: true,
  };
}
