// Ojito para ver u ocultar contraseñas y aviso de coincidencia (aplica a todos los formularios del panel)
(function () {
  var OJO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var OJO_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/></svg>';

  Array.prototype.forEach.call(document.querySelectorAll('input[type="password"]'), function (inp) {
    var wrap = document.createElement('span');
    wrap.className = 'a-pass';
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'a-ojo';
    b.setAttribute('aria-label', 'Mostrar contraseña');
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = OJO;
    b.addEventListener('click', function () {
      var ver = inp.type === 'password';
      inp.type = ver ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(ver));
      b.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
      b.innerHTML = ver ? OJO_OFF : OJO;
      inp.focus();
    });
    wrap.appendChild(b);
  });

  [['clave', 'clave2'], ['claveNueva', 'claveNueva2']].forEach(function (par) {
    var a = document.querySelector('[name="' + par[0] + '"]');
    var c = document.querySelector('[name="' + par[1] + '"]');
    if (!a || !c) return;
    var msg = document.createElement('small');
    msg.setAttribute('aria-live', 'polite');
    c.closest('.a-field').appendChild(msg);
    function revisar() {
      if (!c.value) { msg.textContent = ''; return; }
      var ok = a.value === c.value;
      msg.textContent = ok ? '✔ Las contraseñas coinciden' : '✖ Las contraseñas no coinciden todavía';
      msg.className = ok ? 'a-ok' : 'a-mal';
    }
    a.addEventListener('input', revisar);
    c.addEventListener('input', revisar);
  });
})();

(function () {
  var pv = document.getElementById('vista-previa');
  if (!pv) return;

  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16) / 255; }).map(function (v) {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function onAccent(h) { return ratio(h, '#101010') >= ratio(h, '#ffffff') ? '#101010' : '#ffffff'; }
  function val(n) { var el = document.querySelector('[name="' + n + '"]'); return el ? el.value : ''; }
  function fuente(n) { var el = document.querySelector('[name="' + n + '"]:checked'); return el ? el.getAttribute('data-familia') : ''; }

  function aplicar() {
    var fondo = val('c_fondo'), sup = val('c_superficie'), txt = val('c_texto'), ac = val('c_acento');
    pv.style.setProperty('--bg', fondo);
    pv.style.setProperty('--surface', sup);
    pv.style.setProperty('--text', txt);
    pv.style.setProperty('--accent', ac);
    pv.style.setProperty('--on-accent', onAccent(ac));
    var ft = fuente('f_titulos'), fc = fuente('f_cuerpo');
    if (ft) pv.style.setProperty('--font-titulos', ft);
    if (fc) pv.style.setProperty('--font-cuerpo', fc);

    document.getElementById('pv-eyebrow').textContent = val('t_heroEyebrow');
    document.getElementById('pv-titulo').textContent = val('t_heroTitulo');
    document.getElementById('pv-sub').textContent = val('t_heroSubtitulo');

    var r1 = ratio(txt, fondo), r2 = ratio(txt, sup), r3 = ratio(ac, fondo);
    var ok = r1 >= 4.5 && r2 >= 4.5 && r3 >= 3;
    var aviso = document.getElementById('aviso-contraste');
    aviso.textContent = (ok ? '✔ Legibilidad correcta' : '⚠ Poco contraste: el sitio no permitirá guardar esta combinación') +
      ' (texto/fondo ' + r1.toFixed(1) + ':1, texto/tarjetas ' + r2.toFixed(1) + ':1, acento/fondo ' + r3.toFixed(1) + ':1)';
  }

  document.addEventListener('input', aplicar);
  document.addEventListener('change', aplicar);

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-paleta]');
    if (!b) return;
    var p = JSON.parse(b.getAttribute('data-paleta'));
    ['fondo', 'superficie', 'texto', 'acento'].forEach(function (k) {
      var el = document.querySelector('[name="c_' + k + '"]');
      if (el) el.value = p[k];
    });
    aplicar();
  });

  aplicar();
})();

// Al subir un video: bloquear el botón para no enviarlo dos veces
(function () {
  var f = document.getElementById('form-video');
  if (!f) return;
  f.addEventListener('submit', function () {
    var b = f.querySelector('button[type="submit"]');
    if (b) { b.disabled = true; b.textContent = 'Subiendo… no cierres esta página'; }
  });
})();
