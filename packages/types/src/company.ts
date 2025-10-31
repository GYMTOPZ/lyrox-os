export interface Company {
  id: string;
  ownerId: string;
  name: string;
  industry: string | null;
  website: string | null;
  brandPersonality: string;
  systemPrompt: string | null;
  whatsappPhone: string | null;
  whatsappConnected: boolean;
  whatsappSessionData: any;
  whatsappLastConnected: Date | null;
  active: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface CreateCompanyDto {
  name: string;
  industry?: string;
  website?: string;
  brandPersonality: string;
}

export interface UpdateCompanyDto {
  name?: string;
  industry?: string;
  website?: string;
  brandPersonality?: string;
  systemPrompt?: string;
}

export interface CompanySettings {
  brandPersonality: string;
  systemPrompt?: string;
  whatsappPhone?: string;
}
