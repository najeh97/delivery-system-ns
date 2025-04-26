export type VehicleType = 'Car' | 'Motorcycle';

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: VehicleType;
  modelName: string;
}
