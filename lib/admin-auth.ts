import crypto from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "tash_admin_session";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is missing.");
  }
  return password;
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSessionToken() {
  return crypto.createHmac("sha256", getAdminSessionSecret()).update(getAdminPassword()).digest("hex");
}

export function isValidAdminPassword(password: string) {
  return safeCompare(password, getAdminPassword());
}

export function isAdminRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const bearerPassword = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (bearerPassword && isValidAdminPassword(bearerPassword)) {
      return true;
    }

    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value || "";
    return sessionToken ? safeCompare(sessionToken, createAdminSessionToken()) : false;
  } catch {
    return false;
  }
}
