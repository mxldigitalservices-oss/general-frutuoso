// Extrae el ID de 11 caracteres de enlaces de YouTube (watch, youtu.be, shorts, embed).
const ID = /^[\w-]{11}$/;

exports.parseYouTubeId = function (url = '') {
  const texto = String(url).trim();
  if (!texto) return '';
  let u;
  try { u = new URL(texto); } catch { return ''; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id = '';
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
    else {
      const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
      if (m) id = m[1];
    }
  }
  return ID.test(id) ? id : '';
};
