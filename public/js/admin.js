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
