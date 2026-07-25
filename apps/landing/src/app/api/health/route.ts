import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "landing",
    timestamp: new Date().toISOString(),
  });
}
