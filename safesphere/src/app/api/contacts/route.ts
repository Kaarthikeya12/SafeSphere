import { json, jsonError, parseBody, requireUser } from "@/lib/server/api";
import { countContacts, createContact, listContacts, phoneTaken } from "@/lib/server/records";
import { ContactInput, MAX_CONTACTS } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ contacts: listContacts(user.id) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const input = await parseBody(request, ContactInput);
  if (input instanceof Response) return input;
  if (countContacts(user.id) >= MAX_CONTACTS) return jsonError(`You can save up to ${MAX_CONTACTS} contacts.`, 409);
  if (phoneTaken(user.id, input.phone)) return jsonError("This number is already saved.", 409);
  return json({ contact: createContact(user.id, input) }, { status: 201 });
}
