export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export interface Sale {
  id: string;
  companyId: string;
  customerId: string;
  productId: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus;
  saleDate: Date;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface CreateSaleDto {
  customerId: string;
  productId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paymentId?: string;
}

export interface SaleWithDetails extends Sale {
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
  product: {
    id: string;
    name: string;
  };
}
