import { User } from "./user";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface SetupProfileResponse {
  user: User;
}

export interface MeResponse {
  user: User;
}
