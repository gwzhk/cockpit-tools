import { invoke } from '@tauri-apps/api/core';
import type { PlatformId } from '../types/platform';
import { ALL_PLATFORM_IDS } from '../types/platform';
import type { RemoteConfigAppliedRule, RemoteConfigState } from '../types/remoteConfig';

type RemoteConfigAppliedRuleRaw = {
  platformIds?: unknown;
  platform_ids?: unknown;
  reason?: unknown;
};

type RemoteConfigStateRaw = {
  version?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
  currentOs?: unknown;
  current_os?: unknown;
  hiddenPlatformIds?: unknown;
  hidden_platform_ids?: unknown;
  appliedRules?: unknown;
  applied_rules?: unknown;
  refreshIntervalMs?: unknown;
  refresh_interval_ms?: unknown;
};

const DEFAULT_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

function normalizePlatformIds(value: unknown): PlatformId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<PlatformId>();
  const result: PlatformId[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    if (!ALL_PLATFORM_IDS.includes(item as PlatformId)) continue;
    const platformId = item as PlatformId;
    if (seen.has(platformId)) continue;
    seen.add(platformId);
    result.push(platformId);
  }
  return result;
}

function normalizeAppliedRules(value: unknown): RemoteConfigAppliedRule[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): RemoteConfigAppliedRule | null => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as RemoteConfigAppliedRuleRaw;
      const platformIds = normalizePlatformIds(raw.platformIds ?? raw.platform_ids);
      if (platformIds.length === 0) return null;
      return {
        platformIds,
        reason: typeof raw.reason === 'string' ? raw.reason : null,
      };
    })
    .filter((item): item is RemoteConfigAppliedRule => Boolean(item));
}

function normalizeRemoteConfigState(raw: RemoteConfigStateRaw): RemoteConfigState {
  const refreshIntervalMs = Number(raw.refreshIntervalMs ?? raw.refresh_interval_ms);
  return {
    version: typeof raw.version === 'string' ? raw.version : '',
    updatedAt: Number(raw.updatedAt ?? raw.updated_at) || 0,
    currentOs: typeof (raw.currentOs ?? raw.current_os) === 'string'
      ? String(raw.currentOs ?? raw.current_os)
      : '',
    hiddenPlatformIds: normalizePlatformIds(raw.hiddenPlatformIds ?? raw.hidden_platform_ids),
    appliedRules: normalizeAppliedRules(raw.appliedRules ?? raw.applied_rules),
    refreshIntervalMs:
      Number.isFinite(refreshIntervalMs) && refreshIntervalMs >= 60_000
        ? refreshIntervalMs
        : DEFAULT_REFRESH_INTERVAL_MS,
  };
}

export async function getRemoteConfigState(): Promise<RemoteConfigState> {
  const raw = await invoke<RemoteConfigStateRaw>('remote_config_get_state');
  return normalizeRemoteConfigState(raw);
}

export async function forceRefreshRemoteConfigState(): Promise<RemoteConfigState> {
  const raw = await invoke<RemoteConfigStateRaw>('remote_config_force_refresh');
  return normalizeRemoteConfigState(raw);
}
