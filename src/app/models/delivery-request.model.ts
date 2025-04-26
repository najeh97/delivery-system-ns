export type DeliveryStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface DeliveryRequest {
  id: string;
  deliveryDetails: string;
  date: string;
  clientId: string;
  customerId: string;
  deliveryStatus: DeliveryStatus;
  driverId?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
}
