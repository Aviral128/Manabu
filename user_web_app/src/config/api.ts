export const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.MANABU_API_BASE_URL ??
  process.env.MANABU_BACKEND_URL ??
  process.env.MANABU_BACKEND_API_URL ??
  "https://manabu-production.up.railway.app";
