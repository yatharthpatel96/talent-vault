import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const functionsUrl = url ? `${url.replace(/\/$/, "")}/functions/v1` : "";
export { anonKey };

export function getToken() {
  return localStorage.getItem("talent_vault_token");
}
export function getRole() {
  return localStorage.getItem("talent_vault_role");
}
export function setAuth(token, role) {
  if (token) localStorage.setItem("talent_vault_token", token);
  if (role) localStorage.setItem("talent_vault_role", role);
}
export function clearAuth() {
  localStorage.removeItem("talent_vault_token");
  localStorage.removeItem("talent_vault_role");
}
