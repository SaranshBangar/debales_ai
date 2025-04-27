import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  return new NextResponse("Please use /api/socket/io for Socket.io connections", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

export const dynamic = "force-dynamic";
