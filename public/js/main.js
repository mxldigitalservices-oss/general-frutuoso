// Reproductor ligero: el iframe de YouTube solo se carga cuando el visitante pulsa el póster.
document.addEventListener('click', function (e) {
  var boton = e.target.closest('[data-yt]');
  if (!boton) return;
  var id = boton.getAttribute('data-yt');
  if (!/^[\w-]{11}$/.test(id)) return;
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3';
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  f.referrerPolicy = 'strict-origin-when-cross-origin';
  f.title = 'Reproductor de video';
  boton.replaceWith(f);
});

// Confirmaciones del panel (sin JavaScript en línea, por la política de seguridad)
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
  if (msg && !window.confirm(msg)) e.preventDefault();
});
