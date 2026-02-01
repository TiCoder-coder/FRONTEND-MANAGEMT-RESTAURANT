// Khởi tạo type cho một user
export type AuthUser = {
  id?: string;
  _id?: string;

  company_id?: string;
  email?: string;
  phone?: string;

  full_name?: string;
  role?: string;

  [key: string]: any;
};

// Khởi tạo types cho một login request
export type LoginRequest = {
  email: string;
  phone: string;
  password: string;
};

// Những thông tin mà sẽ trả về sau khi login thành công
export type LoginResponse = {
  accessToken: string;
  refreshToken: string | undefined;
  user?: AuthUser;
};
