import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export function requireAdmin(request: NextRequest) {
  if (isAdminRequest(request)) {
    return null;
  }

  return NextResponse.json(
    {
      error: "Unauthorized"
    },
    {
      status: 401
    }
  );
}
