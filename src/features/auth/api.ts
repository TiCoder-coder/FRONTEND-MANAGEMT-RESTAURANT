import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import {
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "@/src/core/storage/secureStore";
import { LoginRequest, LoginResponse } from "./types";

function deepGet(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}
// Hàm dùng để tìm kiếm accesstoken
function pickAccessToken(data: any): string | null {
  const candidates = [
    "access_token",
    "accessToken",
    "token",

    "data.access_token",
    "data.accessToken",
    "data.token",

    "data.data.access_token",
    "data.data.accessToken",
    "data.data.token",

    "result.access_token",
    "result.accessToken",
    "result.token",

    "tokens.access_token",
    "tokens.accessToken",
    "tokens.access.token",
    "data.tokens.access.token",
  ];

  for (const p of candidates) {
    const v = deepGet(data, p);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

// Hàm dùng để tìm kiếm refreshtoken
function pickRefreshToken(data: any): string | null {
  const candidates = [
    "refresh_token",
    "refreshToken",
    "data.refresh_token",
    "data.refreshToken",
    "data.data.refresh_token",
    "data.data.refreshToken",
    "tokens.refresh_token",
    "tokens.refreshToken",
    "tokens.refresh.token",
    "data.tokens.refresh.token",
  ];

  for (const p of candidates) {
    const v = deepGet(data, p);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

// Hàm dùng để tìm thông tin user
function pickUser(data: any) {
  return (
    data?.user ||
    data?.data?.user ||
    data?.profile ||
    data?.data?.profile ||
    null
  );
}

// Hàm dùng để login (main function login)
export async function login(req: LoginRequest): Promise<LoginResponse> {
  // Nếu gửi payload và login thành công thì trả ra accesstoken, refreshtoken và thông tin user
  const payload = {
    email: req.email,
    phone: req.phone,
    password: req.password,
  };

  const res = await api.post(ENDPOINTS.AUTH_LOGIN, payload);
  console.log("AUTH_LOGIN status: ", res.status);
  console.log("AUTH_LOGIN data: ", JSON.stringify(res.data, null, 2));

  const authHeader =
    (res.headers as any)?.authorization || (res.headers as any)?.Authorization;
  const headerToken =
    typeof authHeader === "string"
      ? authHeader.replace(/^Bearer\s+/i, "").trim()
      : null;
  const data = res.data;

  const accessToken = pickAccessToken(data) ?? headerToken;
  if (!accessToken) {
    throw new Error("Login failed: accessToken not found in response");
  }

  const refreshToken = pickRefreshToken(data) ?? undefined;
  const user = pickUser(data) ?? undefined;
  return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(): Promise<string> {
  const refresh_token = await getRefreshToken();
  if (!refresh_token) {
    throw new Error("No refresh token");
  }
  const res = await api.post(ENDPOINTS.AUTH_REFRESH_TOKEN, { refresh_token });
  const data = res.data;
  const newAccess = pickAccessToken(data);
  if (!newAccess) {
    throw new Error("Refresh failed: accessToken missing.");
  }
  const newRefresh = pickRefreshToken(data);
  await saveAccessToken(newAccess);
  if (newRefresh) {
    await saveRefreshToken(newRefresh);
  }

  return newAccess;
}
