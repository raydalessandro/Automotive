import { verificaTokenOptOut } from "@/lib/campagne/optout";
import { getAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pagina(titolo: string, testo: string, ok: boolean): Response {
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titolo}</title>
<style>body{font-family:Arial,sans-serif;background:#F6F3EC;color:#2B2925;display:flex;min-height:100vh;
align-items:center;justify-content:center;margin:0}.c{max-width:420px;text-align:center;padding:40px;
background:#fff;border-radius:16px;border:1px solid #eee}h1{font-size:20px}p{color:#666;font-size:15px}
.b{color:${ok ? "#B08D4F" : "#c00"}}</style></head>
<body><div class="c"><h1 class="b">${titolo}</h1><p>${testo}</p></div></body></html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// §4: un click → opt_out → mai più selezionabile in nessuna campagna.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const aziendaId = verificaTokenOptOut(token);
  if (!aziendaId) {
    return pagina("Link non valido", "Il link di disiscrizione non è valido o è scaduto.", false);
  }

  const supabase = getAdmin();
  if (supabase) {
    await supabase.from("aziende").update({ stato: "opt_out" }).eq("id", aziendaId);
  }

  return pagina(
    "Iscrizione annullata",
    "Non riceverai più nostre email. Ci dispiace vederti andare via.",
    true,
  );
}
