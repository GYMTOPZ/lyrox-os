export enum AgentType {
  CUSTOMER_ACQUISITION = 'customer-acquisition',
  CUSTOMER_SUPPORT = 'customer-support',
  RETENTION = 'retention',
  FINANCE = 'finance',
  ANALYTICS = 'analytics',
}

export interface AgentLog {
  id: string;
  companyId: string;
  agentType: string;
  eventType: string;
  eventData: Record<string, any>;
  customerId: string | null;
  tokensUsed: number | null;
  responseTimeMs: number | null;
  createdAt: Date;
}

export interface AgentEvent {
  type: string;
  companyId: string;
  customerId?: string;
  data: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  action?: string;
  message?: string;
  data?: any;
}

export interface AgentConfig {
  enabled: boolean;
  settings: Record<string, any>;
}
