import { UserType } from './user-type.enum';

export interface User {
  id?: string;
  email: string;
  password: string;
  userType: UserType;
}
