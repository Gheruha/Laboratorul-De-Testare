import { User } from '@/lib/types/user.type';
export interface UserResponse {
  id: string;
  email?: string;
}
export const mapUserData = async (
  responseData: UserResponse,
): Promise<User> => {
  return {
    id: responseData.id,
    email: responseData.email,
  };
};
