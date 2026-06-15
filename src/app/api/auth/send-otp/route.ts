import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/lib/divar/auth";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست" },
      { status: 400 }
    );
  }

  const result = await sendOtp(phone);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message ?? "ارسال OTP ناموفق بود" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
