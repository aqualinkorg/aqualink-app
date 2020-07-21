export interface User {
  email?: string | null;
  uid?: string | null;
  token?: string | null;
}

export interface UserState {
  userInfo: User | null;
  loading: boolean;
  error?: string | null;
}

export interface UserRequestParams {
  email: string;
  password: string;
}
