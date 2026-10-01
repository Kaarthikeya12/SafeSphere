import { json, requireUser } from "@/lib/server/api";
import { listCommunityReports } from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Opt-in shared reports, anonymised. Signed-in users only. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ reports: listCommunityReports(user.id) });
}
