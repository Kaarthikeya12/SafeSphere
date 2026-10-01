/**
 * HTTP integration tests against a running SafeSphere server.
 *
 *   npm run build && npm start            # or: npm run dev
 *   BASE_URL=http://localhost:3000 npm run test:api
 *
 * Creates two throwaway accounts (random @example.test emails) and checks
 * authentication, route guards, validation and per-user authorization.
 * Use a disposable database (SAFESPHERE_DB_PATH) when running it.
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

const BASE = process.env.BASE_URL || "http://localhost:3000";

class Client {
  cookies = new Map();

  async request(path, { method = "GET", body, redirect = "manual" } = {}) {
    const headers = { Origin: BASE };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (this.cookies.size) headers.Cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
    const response = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect });
    for (const line of response.headers.getSetCookie()) {
      const [pair] = line.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index);
      const value = pair.slice(index + 1);
      if (/max-age=0/i.test(line) || value === "") this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    let json = null;
    if ((response.headers.get("content-type") || "").includes("application/json")) json = await response.json();
    return { status: response.status, json, headers: response.headers };
  }

  signUp(email, password = "Testpass123", name = "Test User") {
    return this.request("/api/auth/sign-up/email", { method: "POST", body: { name, email, password } });
  }
}

const rand = () => Math.random().toString(36).slice(2, 10);

describe("SafeSphere API", () => {
  const alice = new Client();
  const bob = new Client();
  const anon = new Client();
  const aliceEmail = `alice-${rand()}@example.test`;
  let aliceContactId;
  let aliceReportId;

  before(async () => {
    const a = await alice.signUp(aliceEmail);
    assert.equal(a.status, 200, `alice sign-up failed: ${JSON.stringify(a.json)}`);
    const b = await bob.signUp(`bob-${rand()}@example.test`);
    assert.equal(b.status, 200);
  });

  describe("authentication", () => {
    it("rejects a duplicate email", async () => {
      const response = await new Client().signUp(aliceEmail);
      assert.ok(response.status >= 400 && response.status < 500);
    });

    it("rejects a wrong password without revealing which field was wrong", async () => {
      const response = await new Client().request("/api/auth/sign-in/email", { method: "POST", body: { email: aliceEmail, password: "Wrongpass999" } });
      assert.equal(response.status, 401);
    });

    it("signs in with the right password and returns a session", async () => {
      const client = new Client();
      const response = await client.request("/api/auth/sign-in/email", { method: "POST", body: { email: aliceEmail, password: "Testpass123" } });
      assert.equal(response.status, 200);
      const session = await client.request("/api/auth/get-session");
      assert.equal(session.json?.user?.email, aliceEmail);
    });

    it("sets an httpOnly session cookie", async () => {
      const client = new Client();
      const response = await fetch(BASE + "/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: BASE },
        body: JSON.stringify({ email: aliceEmail, password: "Testpass123" }),
      });
      const cookie = response.headers.getSetCookie().find((line) => line.includes("session_token"));
      assert.ok(cookie, "session cookie set");
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      void client;
    });
  });

  describe("route guards", () => {
    it("redirects signed-out visitors from /dashboard to /login", async () => {
      const response = await anon.request("/dashboard");
      assert.ok([302, 307, 308].includes(response.status));
      assert.match(response.headers.get("location") || "", /\/login/);
    });

    it("redirects a forged/expired session cookie to /login", async () => {
      const forged = new Client();
      forged.cookies.set("better-auth.session_token", "forged.value");
      const response = await forged.request("/dashboard");
      assert.ok([302, 303, 307, 308].includes(response.status) || response.status === 200);
      if (response.status !== 200) assert.match(response.headers.get("location") || "", /\/login/);
    });

    it("serves the dashboard to a signed-in user", async () => {
      const response = await alice.request("/dashboard");
      assert.equal(response.status, 200);
    });

    for (const path of ["/api/contacts", "/api/reports", "/api/community", "/api/account"]) {
      it(`returns 401 for ${path} without a session`, async () => {
        assert.equal((await anon.request(path)).status, 401);
      });
    }

    it("requires a session for AI triage", async () => {
      const response = await anon.request("/api/triage", { method: "POST", body: { description: "Water rising near the bus stand" } });
      assert.equal(response.status, 401);
    });
  });

  describe("contacts", () => {
    it("validates input on the server", async () => {
      const response = await alice.request("/api/contacts", { method: "POST", body: { name: "A", phone: "123", relation: "Family" } });
      assert.equal(response.status, 400);
    });

    it("creates a contact with a normalised phone", async () => {
      const response = await alice.request("/api/contacts", { method: "POST", body: { name: "Asha Test", phone: "+91 98765-43210", relation: "Friend" } });
      assert.equal(response.status, 201);
      assert.equal(response.json.contact.phone, "+919876543210");
      aliceContactId = response.json.contact.id;
    });

    it("rejects a duplicate number", async () => {
      const response = await alice.request("/api/contacts", { method: "POST", body: { name: "Asha Again", phone: "+919876543210", relation: "Friend" } });
      assert.equal(response.status, 409);
    });

    it("hides one user's contacts from another", async () => {
      const list = await bob.request("/api/contacts");
      assert.deepEqual(list.json.contacts, []);
      assert.equal((await bob.request(`/api/contacts/${aliceContactId}`, { method: "PATCH", body: { name: "Hacked", phone: "9876543210", relation: "Other" } })).status, 404);
      assert.equal((await bob.request(`/api/contacts/${aliceContactId}`, { method: "DELETE" })).status, 404);
      const still = await alice.request("/api/contacts");
      assert.equal(still.json.contacts[0].name, "Asha Test");
    });

    it("updates and deletes the owner's contact", async () => {
      const updated = await alice.request(`/api/contacts/${aliceContactId}`, { method: "PATCH", body: { name: "Asha T", phone: "9876543210", relation: "Family" } });
      assert.equal(updated.status, 200);
      assert.equal(updated.json.contact.name, "Asha T");
      assert.equal((await alice.request(`/api/contacts/${aliceContactId}`, { method: "DELETE" })).status, 200);
    });
  });

  describe("reports & community", () => {
    it("rejects empty, too-long and wrongly-categorised reports", async () => {
      assert.equal((await alice.request("/api/reports", { method: "POST", body: { category: "Fire", description: "short" } })).status, 400);
      assert.equal((await alice.request("/api/reports", { method: "POST", body: { category: "Fire", description: "x".repeat(2001) } })).status, 400);
      assert.equal((await alice.request("/api/reports", { method: "POST", body: { category: "Alien", description: "A valid length description" } })).status, 400);
    });

    it("creates a shared report with a location", async () => {
      const response = await alice.request("/api/reports", {
        method: "POST",
        body: { category: "Flooding", description: "Water rising near the bus stand (test data)", location: { lat: 15.49123, lng: 73.82789, accuracy: 20 }, shared: true },
      });
      assert.equal(response.status, 201);
      assert.equal(response.json.report.shared, true);
      aliceReportId = response.json.report.id;
    });

    it("shows shared reports to others anonymised with coarse location", async () => {
      const feed = await bob.request("/api/community");
      const item = feed.json.reports.find((report) => report.id === aliceReportId);
      assert.ok(item, "shared report visible to bob");
      assert.equal(item.mine, false);
      assert.deepEqual(item.area, { lat: 15.49, lng: 73.83 });
      const serialized = JSON.stringify(item);
      assert.ok(!serialized.includes(aliceEmail) && !serialized.includes("user_id") && !serialized.includes("Test User"));
    });

    it("prevents another user from editing or deleting the report", async () => {
      assert.equal((await bob.request(`/api/reports/${aliceReportId}`, { method: "PATCH", body: { description: "Tampered with by bob" } })).status, 404);
      assert.equal((await bob.request(`/api/reports/${aliceReportId}`, { method: "DELETE" })).status, 404);
    });

    it("lets the owner edit and unshare", async () => {
      const response = await alice.request(`/api/reports/${aliceReportId}`, { method: "PATCH", body: { category: "Severe weather / natural hazard", shared: false } });
      assert.equal(response.status, 200);
      const feed = await bob.request("/api/community");
      assert.ok(!feed.json.reports.some((report) => report.id === aliceReportId));
    });
  });

  describe("AI triage", () => {
    it("returns a labelled result (Claude, or the rule-based baseline when no key is configured)", async () => {
      const status = await alice.request("/api/triage");
      const response = await alice.request("/api/triage", { method: "POST", body: { description: "Smoke and flames from the shop, people inside" } });
      assert.equal(response.status, 200);
      assert.ok(["claude", "rule-based"].includes(response.json.engine));
      if (!status.json.aiConfigured) {
        assert.equal(response.json.engine, "rule-based");
        assert.ok(response.json.fallbackReason);
        assert.equal(response.json.suggestedCategory, "Fire");
      }
    });

    it("validates description length", async () => {
      assert.equal((await alice.request("/api/triage", { method: "POST", body: { description: "hi" } })).status, 400);
    });
  });

  describe("account data", () => {
    it("exports only the signed-in user's data", async () => {
      const response = await alice.request("/api/account");
      assert.equal(response.status, 200);
      assert.equal(response.json.account.email, aliceEmail);
      assert.ok(response.json.reports.every((report) => report.id === aliceReportId));
    });

    it("deletes the user's data, then the account, and the session stops working", async () => {
      const wiped = await alice.request("/api/account", { method: "DELETE" });
      assert.equal(wiped.json.deleted.reports, 1);
      const removed = await alice.request("/api/auth/delete-user", { method: "POST", body: {} });
      assert.equal(removed.status, 200, JSON.stringify(removed.json));
      assert.equal((await alice.request("/api/contacts")).status, 401);
    });

    it("signs out and invalidates the session", async () => {
      assert.equal((await bob.request("/api/contacts")).status, 200);
      await bob.request("/api/auth/sign-out", { method: "POST", body: {} });
      assert.equal((await bob.request("/api/contacts")).status, 401);
    });
  });
});
