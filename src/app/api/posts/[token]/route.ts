import { NextRequest, NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getManagementPage } from "@/lib/divar/posts";
import { divarErrorResponse } from "@/lib/divar/api-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const { token } = await params;
  try {
    const data = await getManagementPage(session, token);
    return NextResponse.json(data);
  } catch (e) {
    return divarErrorResponse(e);
  }
}
