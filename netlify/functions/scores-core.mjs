// Leaderboard logic, kept separate from Netlify so it can be tested on its own.
// store needs: get(key, {type:"json"}), setJSON(key, value), list({prefix}), delete(key)

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "cache-control": "no-store",
};

function send(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function cleanName(v) {
  return String(v || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 14);
}

function cleanId(v) {
  return String(v || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
}

export async function handle(req, store, adminKey) {
  const method = req.method;

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...JSON_HEADERS,
        "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
        "access-control-allow-headers": "content-type,x-admin-key",
      },
    });
  }

  if (method === "GET") {
    const { blobs } = await store.list({ prefix: "p/" });
    const rows = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" }))))
      .filter((r) => r && typeof r.score === "number")
      .sort((a, b) => b.score - a.score || (a.at || 1e15) - (b.at || 1e15))
      .slice(0, 500);
    return send(rows);
  }

  if (method === "POST") {
    let body;
    try {
      body = JSON.parse(await req.text());
    } catch {
      return send({ error: "Bad JSON" }, 400);
    }
    const id = cleanId(body.id);
    const name = cleanName(body.name) || "Player";
    const score = Math.floor(Number(body.score));
    if (!id || !Number.isFinite(score) || score < 0 || score > 40000) return send({ error: "Invalid score" }, 400);
    const letters = Math.max(0, Math.min(8, Math.floor(Number(body.letters) || 0)));
    const key = "p/" + id;
    const existing = await store.get(key, { type: "json" });
    if (!existing || score > existing.score) {
      await store.setJSON(key, { id, name, score, won: !!body.won, letters, at: Date.now() });
    }
    return send({ ok: true });
  }

  if (method === "DELETE") {
    if (!adminKey || req.headers.get("x-admin-key") !== adminKey) return send({ error: "Not allowed" }, 403);
    const id = cleanId(new URL(req.url).searchParams.get("id"));
    const { blobs } = await store.list({ prefix: "p/" });
    let removed = 0;
    for (const b of blobs) {
      if (!id || b.key === "p/" + id) {
        await store.delete(b.key);
        removed++;
      }
    }
    return send({ ok: true, removed });
  }

  return send({ error: "Method not allowed" }, 405);
}
