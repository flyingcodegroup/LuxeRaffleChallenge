import { User } from '@/types/User';

export const encryptToken = (user: User) => {
  try {
    return Buffer.from(JSON.stringify(user)).toString('base64');
  } catch {
    return null;
  }
};

export const decryptToken = (token: string) => {
  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decodedToken) as User;
  } catch {
    return null;
  }
};
