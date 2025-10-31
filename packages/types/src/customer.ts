export enum CustomerStage {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  CUSTOMER = 'CUSTOMER',
  CHURNED = 'CHURNED',
}

export interface Customer {
  id: string;
  companyId: string;
  phone: string;
  name: string | null;
  email: string | null;
  stage: CustomerStage;
  firstContact: Date;
  lastInteraction: Date | null;
  totalInteractions: number;
  lifetimeValue: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export interface CreateCustomerDto {
  phone: string;
  name?: string;
  email?: string;
  stage?: CustomerStage;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  stage?: CustomerStage;
  tags?: string[];
}
