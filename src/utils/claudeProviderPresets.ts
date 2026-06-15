import {
  APIKEY_FUN_DEFAULT_MODEL_CATALOG,
  APIKEY_FUN_GLOBAL_ENDPOINT,
  APIKEY_FUN_REGISTER_URL,
  APIKEY_FUN_SOURCE_TAG,
} from './apikeyFunLinks';

export type ClaudeApiKeyField = 'ANTHROPIC_AUTH_TOKEN' | 'ANTHROPIC_API_KEY';

export interface ClaudeApiProviderPreset {
  id: string;
  name: string;
  baseUrls: string[];
  apiKeyField: ClaudeApiKeyField;
  website?: string;
  apiKeyUrl?: string;
  isOfficial?: boolean;
  isPartner?: boolean;
  sourceTag?: string;
  modelCatalog?: string[];
  extraEnv?: Record<string, string>;
}

export const CLAUDE_API_PROVIDER_CUSTOM_ID = 'custom';
export const CLAUDE_APIKEY_FUN_PROVIDER_ID = 'apikey_fun';
export const CLAUDE_APIKEY_FUN_BASE_URL = APIKEY_FUN_GLOBAL_ENDPOINT;

export const CLAUDE_API_PROVIDER_PRESETS: readonly ClaudeApiProviderPreset[] = [
  {
    id: CLAUDE_APIKEY_FUN_PROVIDER_ID,
    name: 'APIKEY.FUN',
    baseUrls: [CLAUDE_APIKEY_FUN_BASE_URL, 'https://slb.apikey.fun'],
    apiKeyField: 'ANTHROPIC_AUTH_TOKEN',
    website: 'https://apikey.fun',
    apiKeyUrl: APIKEY_FUN_REGISTER_URL,
    isPartner: true,
    sourceTag: APIKEY_FUN_SOURCE_TAG,
    modelCatalog: [...APIKEY_FUN_DEFAULT_MODEL_CATALOG],
    extraEnv: {
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
    },
  },
  {
    id: 'anthropic_official',
    name: 'Anthropic Official',
    baseUrls: [''],
    apiKeyField: 'ANTHROPIC_API_KEY',
    website: 'https://www.anthropic.com/claude-code',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    isOfficial: true,
  },
  {
    id: 'shengsuanyun',
    name: 'Shengsuanyun',
    baseUrls: ['https://router.shengsuanyun.com/api'],
    apiKeyField: 'ANTHROPIC_AUTH_TOKEN',
    website: 'https://www.shengsuanyun.com/?from=CH_4HHXMRYF',
    apiKeyUrl: 'https://www.shengsuanyun.com/?from=CH_4HHXMRYF',
    isPartner: true,
    extraEnv: {
      ANTHROPIC_MODEL: 'anthropic/claude-sonnet-4.6',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'anthropic/claude-haiku-4.5',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'anthropic/claude-sonnet-4.6',
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'anthropic/claude-opus-4.8',
    },
  },
  {
    id: 'pateway_ai',
    name: 'PatewayAI',
    baseUrls: ['https://api.pateway.ai'],
    apiKeyField: 'ANTHROPIC_API_KEY',
    website: 'https://pateway.ai',
    apiKeyUrl: 'https://pateway.ai/?ch=etzpm8&aff=WB6M6F67#/',
    isPartner: true,
  },
  {
    id: 'volcengine_agentplan',
    name: '火山Agentplan',
    baseUrls: ['https://ark.cn-beijing.volces.com/api/coding'],
    apiKeyField: 'ANTHROPIC_AUTH_TOKEN',
    website: 'https://www.volcengine.com/product/ark',
    isPartner: true,
    extraEnv: {
      ANTHROPIC_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'ark-code-latest',
    },
  },
  {
    id: 'byteplus',
    name: 'BytePlus',
    baseUrls: ['https://ark.ap-southeast.bytepluses.com/api/coding'],
    apiKeyField: 'ANTHROPIC_AUTH_TOKEN',
    website: 'https://www.byteplus.com/en/product/modelark',
    isPartner: true,
    extraEnv: {
      ANTHROPIC_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'ark-code-latest',
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'ark-code-latest',
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrls: ['https://api.deepseek.com/anthropic'],
    apiKeyField: 'ANTHROPIC_AUTH_TOKEN',
    website: 'https://platform.deepseek.com',
    modelCatalog: ['deepseek-v4-pro', 'deepseek-v4-flash'],
    extraEnv: {
      ANTHROPIC_MODEL: 'deepseek-v4-pro',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'deepseek-v4-flash',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'deepseek-v4-pro',
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'deepseek-v4-pro',
    },
  },
];

export function findClaudeApiProviderPresetById(
  id?: string | null,
): ClaudeApiProviderPreset | null {
  if (!id) return null;
  return CLAUDE_API_PROVIDER_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function normalizeClaudeApiProviderBaseUrl(value?: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function inferClaudeApiKeyField(
  provider: ClaudeApiProviderPreset | null | undefined,
  baseUrl?: string | null,
): ClaudeApiKeyField {
  if (provider && provider.id !== CLAUDE_API_PROVIDER_CUSTOM_ID) {
    return provider.apiKeyField;
  }

  const normalizedBaseUrl = normalizeClaudeApiProviderBaseUrl(baseUrl);
  if (normalizedBaseUrl === '') {
    return 'ANTHROPIC_API_KEY';
  }
  if (normalizedBaseUrl === null) {
    return 'ANTHROPIC_AUTH_TOKEN';
  }

  try {
    const host = new URL(normalizedBaseUrl).hostname.toLowerCase();
    return host === 'api.anthropic.com' || host === 'api.claude.com'
      ? 'ANTHROPIC_API_KEY'
      : 'ANTHROPIC_AUTH_TOKEN';
  } catch {
    return 'ANTHROPIC_AUTH_TOKEN';
  }
}

export function getDefaultClaudeApiProviderPresetId(): string {
  return CLAUDE_APIKEY_FUN_PROVIDER_ID;
}
