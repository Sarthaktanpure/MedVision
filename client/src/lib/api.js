const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("medivision_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: (path, body, options) =>
    request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export async function apiFile(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
