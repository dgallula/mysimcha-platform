import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "docs",
    timestamp: new Date().toISOString(),
  });
}
