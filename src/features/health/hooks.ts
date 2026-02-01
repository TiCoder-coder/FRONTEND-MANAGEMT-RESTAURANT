import { useCallback, useState } from "react";
import { HEALTH_ENDPOINT, HealthPingResult, ping, pingAuto } from "./api";

type ApiErrorLike = {
  status?: number | null;
  message?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  details?: unknown;
};

export function useHealthCheck() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthPingResult | null>(null);
  const [error, setError] = useState<ApiErrorLike | null>(null);

  const run = useCallback(async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await ping(endpoint);
      setResult(r);
      return r;
    } catch (error: unknown) {
      setResult(null);
      setError(error ?? { message: "Unknown error" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const runAuto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await pingAuto(HEALTH_ENDPOINT as unknown as string[]);
      setResult(r);
      return r;
    } catch (error: unknown) {
      setResult(null);
      setError(error ?? { message: "Unknown error" });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, run, runAuto, reset };
}
