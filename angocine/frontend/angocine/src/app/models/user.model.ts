export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  avatar: string;
  is_kid: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  error: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User & {
      profiles?: Profile[];
    };
  };
}