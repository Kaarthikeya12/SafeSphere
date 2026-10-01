import { json, jsonError, parseBody, requireUser } from "@/lib/server/api";
import { countReports, createReport, listReports } from "@/lib/server/records";
import { MAX_REPORTS, ReportInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ reports: listReports(user.id) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const input = await parseBody(request, ReportInput);
  if (input instanceof Response) return input;
  if (countReports(user.id) >= MAX_REPORTS) return jsonError(`You can keep up to ${MAX_REPORTS} reports. Delete older ones first.`, 409);
  return json({ report: createReport(user.id, input) }, { status: 201 });
}
