import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/divar/auth";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (!phone || !code) {
    return NextResponse.json(
      { error: "شماره و کد الزامی است" },
      { status: 400 }
    );
  }

  const result = await verifyOtp(phone, code);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message ?? "کد اشتباه است" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    expiresAt: result.session?.expiresAt,
  });
}
