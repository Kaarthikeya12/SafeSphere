import { json, jsonError, parseBody, requireUser } from "@/lib/server/api";
import { deleteContact, phoneTaken, updateContact } from "@/lib/server/records";
import { ContactInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, ctx: RouteContext<"/api/contacts/[id]">) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  const input = await parseBody(request, ContactInput);
  if (input instanceof Response) return input;
  if (phoneTaken(user.id, input.phone, id)) return jsonError("This number is already saved.", 409);
  const contact = updateContact(user.id, id, input);
  return contact ? json({ contact }) : jsonError("Contact not found.", 404);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/contacts/[id]">) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  return deleteContact(user.id, id) ? json({ ok: true }) : jsonError("Contact not found.", 404);
}
