import { json, requireUser } from "@/lib/server/api";
import { deleteUserData } from "@/lib/server/db";
import { listContacts, listReports } from "@/lib/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export everything SafeSphere stores about the signed-in user. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(
    { exportedAt: new Date().toISOString(), account: user, contacts: listContacts(user.id), reports: listReports(user.id) },
    { headers: { "Content-Disposition": 'attachment; filename="safesphere-export.json"' } },
  );
}

/** Delete the user's contacts and reports (the account itself is deleted via Better Auth). */
export async function DELETE() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ deleted: deleteUserData(user.id) });
}
