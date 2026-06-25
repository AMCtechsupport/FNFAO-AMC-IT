import { NextResponse } from "next/server";
import { getLoginDomain, isAzureSsoConfigured } from "@/app/lib/sso-config";

export async function GET() {
  return NextResponse.json({
    ssoConfigured: isAzureSsoConfigured(),
    loginDomain: getLoginDomain(),
  });
}
