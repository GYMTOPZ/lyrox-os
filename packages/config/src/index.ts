// LYROX OS - Shared Configuration
// Constants and configuration shared across apps

export const APP_CONFIG = {
  name: 'LYROX OS',
  version: '0.2.0',
  description: 'Autonomous Business Operating System',
} as const;

export const API_CONFIG = {
  version: 'v1',
  prefix: 'api',
  timeout: 30000, // 30 seconds
} as const;

export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultPerPage: 20,
  maxPerPage: 100,
} as const;

export const RATE_LIMIT_CONFIG = {
  auth: {
    windowMs: 60000, // 1 minute
    maxRequests: 5,
  },
  api: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
  },
  whatsapp: {
    windowMs: 60000, // 1 minute
    maxRequests: 1000,
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxAgents: 1,
    maxInteractions: 1000,
    maxIntegrations: 3,
  },
  starter: {
    maxAgents: 3,
    maxInteractions: 1000,
    maxIntegrations: 3,
  },
  professional: {
    maxAgents: 6,
    maxInteractions: 10000,
    maxIntegrations: -1, // unlimited
  },
  enterprise: {
    maxAgents: -1, // unlimited
    maxInteractions: -1, // unlimited
    maxIntegrations: -1, // unlimited
  },
} as const;

export const AI_CONFIG = {
  defaultModel: 'gpt-4o',
  maxTokens: 1000,
  temperature: 0.7,
  maxConversationHistory: 20, // messages
} as const;

export const WHATSAPP_CONFIG = {
  sessionTimeout: 3600000, // 1 hour in ms
  qrCodeExpiry: 60, // seconds
  maxRetries: 3,
} as const;
