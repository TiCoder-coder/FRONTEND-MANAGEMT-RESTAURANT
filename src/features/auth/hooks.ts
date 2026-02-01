// KẾT NỐI VỚI UI VÀ LẤY CÁC THÔNG TIN TỪ UI XUỐNG VÀ THỰC THI NÓ

import { useAuthStore } from "./store";

// Lấy thông tin người dùng
export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  return {
    hydrated,
    isLoggedIn: !!accessToken,
    accessToken,
    user,
  };
}

// Action
export function useAuthActions() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  return { hydrate, login, logout };
}

// Status
export function useAuthStatus() {
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  return { loading, error };
}
