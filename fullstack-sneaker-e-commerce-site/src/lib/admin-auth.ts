import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sh_admin";

function secret() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function adminEnabled() {
  return secret().length > 0;
}

function token() {
  return createHmac("sha256", secret()).update("solehouse-admin-session").digest("hex");
}

export function passwordMatches(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(secret());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionToken() {
  return token();
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!c) return false;
  const a = Buffer.from(c);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}
