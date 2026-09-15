import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

// One axios instance for the whole app — every service module below builds
// on this instead of calling fetch/axios directly, so token injection and
// 401 handling only ever live in one place.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // sends the httpOnly refresh cookie
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Deliberately a plain axios call, never `apiClient` — this is the refresh
// request itself, so it must not be able to trigger the response
// interceptor below (which would otherwise try to "refresh the refresh").
// `refreshInFlight` also collapses React StrictMode's double effect-invoke
// (and any other concurrent 401s) into exactly one network call.
let refreshInFlight: Promise<{ accessToken: string; user: unknown } | null> | null = null;

export async function refreshSession(): Promise<{ accessToken: string; user: unknown } | null> {
  refreshInFlight ??= axios
    .post(`${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`, {}, { withCredentials: true })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.accessToken, data.user);
      return data;
    })
    .catch(() => {
      useAuthStore.getState().clearSession();
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

// A 401 on any *other* request triggers exactly one shared refresh attempt
// and replays the original call once the new token is in hand.
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh');
    if (!isRefreshCall && error.response?.status === 401 && original && !(original as { _retried?: boolean })._retried) {
      (original as { _retried?: boolean })._retried = true;
      const result = await refreshSession();
      if (result) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${result.accessToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    // No `response` means the request never got a reply to read — a CORS
    // rejection, DNS failure, or the API being unreachable. That is a
    // materially different problem from the server validating the request
    // and returning a real error body, so it must never collapse into the
    // same caller-supplied fallback (e.g. "Invalid email or password") —
    // that misdiagnoses a broken connection as a wrong password.
    if (!error.response) {
      return 'Could not reach the server. Check your connection and try again.';
    }
    return (error.response.data as { error?: { message?: string } })?.error?.message ?? fallback;
  }
  return fallback;
}
