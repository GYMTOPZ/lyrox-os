export interface Product {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  paymentLink: string | null;
  stripePriceId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  paymentLink?: string;
  stripePriceId?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  paymentLink?: string;
  stripePriceId?: string;
  active?: boolean;
}
