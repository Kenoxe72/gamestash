/** Proxy Steam appdetails — config PC + résumé (évite CORS) */
export async function onRequestGet(context) {
  const id = String(context.params.id || "");
  if (!/^\d{1,10}$/.test(id)) {
    return Response.json({ ok: false, error: "id" }, { status: 400 });
  }

  const steamUrl =
    "https://store.steampowered.com/api/appdetails?appids=" +
    id +
    "&l=french&cc=FR";

  try {
    const res = await fetch(steamUrl, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "User-Agent": "JeuxStash/1.0 (+https://www.jeuxstash.fr)",
      },
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) {
      return Response.json({ ok: false, error: "steam" }, { status: 502 });
    }
    const raw = await res.json();
    const entry = raw && raw[id];
    if (!entry || !entry.success || !entry.data) {
      return Response.json({ ok: false, error: "missing" }, { status: 404 });
    }
    const d = entry.data;
    const pc = d.pc_requirements || {};
    const payload = {
      ok: true,
      id: Number(id),
      name: d.name || null,
      short: d.short_description || null,
      release: (d.release_date && d.release_date.date) || null,
      genres: (d.genres || []).map(function (g) {
        return g.description;
      }),
      developers: d.developers || [],
      publishers: d.publishers || [],
      platforms: d.platforms || {},
      metacritic: (d.metacritic && d.metacritic.score) || null,
      min: pc.minimum || null,
      rec: pc.recommended || null,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return Response.json({ ok: false, error: "fetch" }, { status: 502 });
  }
}
