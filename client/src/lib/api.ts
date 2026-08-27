import type { AgendaItem, AppSettings, BookItem, SiteContent } from "@shared/content";

const TOKEN_KEY = "clube_admin_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function fetchContent(): Promise<SiteContent> {
  const res = await fetch("/api/content", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar o conteúdo.");
  return res.json();
}

export async function login(email: string): Promise<string> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Não foi possível entrar.");
  }
  const data = await res.json();
  return data.token as string;
}

async function put(path: string, body: unknown, token: string): Promise<SiteContent> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("Sessão expirada. Entre novamente.");
  if (!res.ok) throw new Error("Não foi possível salvar.");
  return res.json();
}

export const saveAgenda = (agenda: AgendaItem[], token: string) =>
  put("/api/agenda", { agenda }, token);

export const saveBooks = (books: BookItem[], token: string) =>
  put("/api/books", { books }, token);

export async function getSettings(token: string): Promise<AppSettings> {
  const res = await fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error("Sessão expirada. Entre novamente.");
  if (!res.ok) throw new Error("Não foi possível carregar as configurações.");
  return res.json();
}

export async function saveSettings(settings: AppSettings, token: string): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
  if (res.status === 401) throw new Error("Sessão expirada. Entre novamente.");
  if (!res.ok) throw new Error("Não foi possível salvar as configurações.");
  return res.json();
}

// Upload direto (unsigned) do navegador para o Cloudinary. Retorna a URL segura.
export async function uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || "Falha no upload para o Cloudinary.");
  }
  const data = await res.json();
  return data.secure_url as string;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}
