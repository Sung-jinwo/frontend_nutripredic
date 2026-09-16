import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

const TOKEN_KEY = "nutripredict_access_token";
export const SESSION_EXPIRED_EVENT = "nutripredict:session-expired";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean; silentStatuses?: number[]; notifySuccess?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, silentStatuses = [], notifySuccess = true, ...init } = options;
  const token = tokenStorage.get();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => {
    const message = "No se pudo conectar con el servidor. Comprueba la conexión e inténtalo nuevamente.";
    toast.error(message, { id: "api-network-error" });
    throw new ApiError(message, 0);
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    const message =
      (payload && typeof payload === "object" && "message" in payload && String(payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Error HTTP ${response.status}`;
    if (!silentStatuses.includes(response.status)) toast.error(message, { id: `api-error-${path}-${response.status}` });
    throw new ApiError(message, response.status, payload);
  }

  if (notifySuccess && init.method && init.method !== "GET") {
    toast.success(init.method === "DELETE" ? "Registro eliminado correctamente." : "Operación completada correctamente.");
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
