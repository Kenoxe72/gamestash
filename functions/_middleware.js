/** Redirige jeuxstash.fr → www.jeuxstash.fr (canonical) */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "jeuxstash.fr") {
    url.hostname = "www.jeuxstash.fr";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
