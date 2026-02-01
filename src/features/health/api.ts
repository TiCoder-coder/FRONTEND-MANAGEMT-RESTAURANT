import { api } from "@/src/api/client";

export const HEALTH_ENDPOINT = [
  "/health",
  "restaurant/v1/health",
  "/restaurants/v1",
] as const;

export type HealthPingResult = {
  endpoint: string; // Đường dẫn tới endpoint
  status: number; // Trạng thái của htttp
  durationMs: number; // Tốc độ phản hồi
  data: unknown; // Toàn bộ dữ liệu JSON mà backend trả về (trên swagger)
};

// Thực hiện gọi API duy nhát một lần
export async function ping(endpoint: string): Promise<HealthPingResult> {
  const ep = endpoint.startsWith("/") ? endpoint : `/${endpoint}`; // Đảm bảo đường dẫn luôn có dấu /
  const t0 = Date.now(); // Bát đầu do thời gian
  const res = await api.get(ep); // Thực hiện gọi API
  const t1 = Date.now(); // Kết thúc đo

  return {
    endpoint: ep,
    status: res.status,
    durationMs: t1 - t0,
    data: res.data,
  };
}

// Hàm dùng để tìm endpoint đúng
export async function pingAuto(
  endpoints: readonly string[] = HEALTH_ENDPOINT,
): Promise<HealthPingResult> {
  let lastErr: unknown = null;

  for (const ep of endpoints) {
    try {
      return await ping(ep);
    } catch (error: unknown) {
      lastErr = error;
    }
  }
  throw lastErr ?? new Error("No health endpoint succeeded");
}
