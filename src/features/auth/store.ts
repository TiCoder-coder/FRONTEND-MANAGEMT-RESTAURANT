import {
  clearToken,
  getAccessToken,
  getRefreshToken,
  getUser,
  saveAccessToken,
  saveRefreshToken,
  saveUser,
} from "@/src/core/storage/secureStore";
import { create } from "zustand";
import { login as loginApi } from "./api";
import type { AuthUser, LoginRequest } from "./types";

// Định nghĩa các trạng thái và hành động cho auth
type AuthState = {
  // Trạng thái
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  hydrated: boolean;
  loading: boolean;
  error: string | null;

  // Hành động
  hydrate: () => Promise<void>;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

// Hàm dùng để chuẩn hoá lỗi thành string
function toMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unknown error"
  );
}

// Tạo một biến lưu trữ thông tin người dùng
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  hydrated: false,
  loading: false,
  error: null,

  // Action dùng để khôi phục đăng nhập
  hydrate: async () => {
    try {
      const [at, rt, u] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
        getUser<AuthUser>(),
      ]);

      set({
        accessToken: at,
        refreshToken: rt,
        user: u,
        hydrated: true,
      });
    } catch (error: any) {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        hydrated: true,
        error: toMessage(error) ?? "Hydrate failed",
      });
    }
  },

  // Bật loading - xoá lỗi cũ - gọi API login
  login: async (req) => {
    set({ loading: true, error: null });
    try {
      const res = await loginApi(req);

      // Lưu xuống sourceStore để lưu trữ
      await Promise.all([
        saveAccessToken(res.accessToken),
        res.refreshToken
          ? saveRefreshToken(res.refreshToken)
          : Promise.resolve(),
        res.user ? saveUser(res.user) : Promise.resolve(),
      ]);

      set({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? null,
        user: res.user ?? null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const message = toMessage(error);
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  // Action logout
  logout: async () => {
    await clearToken();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      error: null,
    });
  },
}));
