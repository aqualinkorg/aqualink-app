export interface SignInFormFields {
  emailAddress: string;
  password: string;
}

export interface RegisterFormFields {
  firstName: string;
  lastName: string;
  organization: string;
  emailAddress: string;
  password: string;
}

export type Extends<T, U extends T> = U;
