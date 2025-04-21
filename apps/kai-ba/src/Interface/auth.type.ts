export type UserInfo = {
  id: string;
  email: string;
  account: string;
  role?: string[];
  provider: 'local' | 'google' | 'facebook';
};

export type JWTPayload = UserInfo & {
  exp?: number;
  iat?: number;
};
