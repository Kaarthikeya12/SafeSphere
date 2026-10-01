import { json, jsonError, parseBody, requireUser } from "@/lib/server/api";
import { deleteReport, updateReport } from "@/lib/server/records";
import { ReportUpdate } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, ctx: RouteContext<"/api/reports/[id]">) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  const input = await parseBody(request, ReportUpdate);
  if (input instanceof Response) return input;
  const report = updateReport(user.id, id, input);
  return report ? json({ report }) : jsonError("Report not found.", 404);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/reports/[id]">) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  return deleteReport(user.id, id) ? json({ ok: true }) : jsonError("Report not found.", 404);
}
