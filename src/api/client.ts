import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ENV } from "../core/config/env";
import { clearToken, getAccessToken } from "../core/storage/secureStore";
import { refreshAccessToken } from "../features/auth/api";

// Khởi tạo một biến toàn cục dùng để lưu một callback
let unauthorizedHandler: (() => void) | null = null;

// Khỏi tạo để những file nào cần callback loại nào thì overwrite lại
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function isMultipart(config: AxiosRequestConfig) {
  const h = (config.headers ?? {}) as Record<string, any>;
  const ct = h["Content-Type"] || h["content-type"];
  return (
    typeof ct === "string" &&
    ct.toLocaleLowerCase().includes("multipart/form-data")
  );
}

export const api: AxiosInstance = axios.create({
  baseURL: ENV.BASE_URL,
  timeout: ENV.TIME_OUT, // Quá thời gian thì request fail
  headers: { Accept: "application/json" }, // Gửi yêu cầu lên server để nhận kiểu JOSN
});

// Kiểm tra request trước
api.interceptors.request.use(
  // Nếu môi trường chưa có x-api-key thì tự gán thêm vào
  async (config) => {
    if (ENV.X_API_KEY && !config.headers["x-api-key"]) {
      config.headers["x-api-key"] = ENV.X_API_KEY;
    }

    // Kiểm tra và gắn thêm Bearer cho token
    const token = await getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu chưa có multi-part và chưa có content-type thì sett json
    if (!isMultipart(config) && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // Nếu có lỗi thì in ra
    if (ENV.DEBUG) {
      const method = (config.method || "GET").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      console.log(`[API] ${method} ${url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false; // Cờ báo hiệu hiện tại có đang gọi refresh token hay không
let waiters: ((token: string) => void)[] = []; // Danh sách callback của các request đang phải chờ token mới

// Hàm đợi --- thêm các đối tượng vào danh sách chờ
function subcribe(cb: (token: string) => void) {
  waiters.push(cb);
}

// Khi refresh thành công thì chạy hết tât cả trong waiter
// và mỗi callback sễ retry request tương ứng, xong thì reset waiter
function notify(token: string) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

// Xử lí request
api.interceptors.response.use(
  (res) => res, // Nếu request ok hết thì trả về luôn

  // Nếu server trả 401 thì xoá token, còn nếu mà unauthorizedHandler thì callback lại
  async (error) => {
    const original = error.config;

    // Lỗi mạng --> trả lỗi ra ngoài
    if (!error.response) {
      return Promise.reject(error);
    }

    // Chỉ trạng thái 401 (lỗi access token hết hạn) mới xử lí refresh
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Chặn retry vô hạn - nếu request bị 401 lần 2 thì stop
    if (original?._retry) {
      return Promise.reject(error);
    }

    original._retry = true; // Gắn cờ vào request config

    if (isRefreshing) {
      return new Promise((resolve) => {
        subcribe((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      notify(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (error: any) {
      isRefreshing = false;
      waiters = [];
      await clearToken();
      return Promise.reject(error);
    }
  },
);
