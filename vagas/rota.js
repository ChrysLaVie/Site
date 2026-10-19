// Abre lavieconsultoria.com/vagas/nome-da-vaga.
// Usado pelas páginas próprias de cada vaga (vagas/<nome>/index.html) e pelo
// 404.html do site, para vagas que ainda não têm página própria.
// Monta a página de vagas normal mantendo o endereço; ela mesma lê o nome da
// vaga no endereço e já abre o card certo. Os scripts são recriados um a um,
// na ordem da página (sem document.write, que o Chrome bloqueia em rede lenta).
(function () {
  function plano() {
    var m = location.pathname.match(/^\/vagas\/([^\/]+)\/?$/);
    location.replace('/vagas/' + (m ? '?vaga=' + m[1] : ''));
  }
  function rodar(orig) {
    return new Promise(function (ok) {
      var s = document.createElement('script');
      for (var i = 0; i < orig.attributes.length; i++) s.setAttribute(orig.attributes[i].name, orig.attributes[i].value);
      if (orig.src) { s.onload = ok; s.onerror = ok; s.src = orig.src; }
      else { s.textContent = orig.textContent; }
      (orig.dataset.lugar === 'head' ? document.head : document.body).appendChild(s);
      if (!orig.src) ok();
    });
  }
  fetch('/vagas/index.html', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (html) {
      var d = new DOMParser().parseFromString(html, 'text/html');
      var scripts = [].slice.call(d.querySelectorAll('script'));
      scripts.forEach(function (s) { s.dataset.lugar = d.head.contains(s) ? 'head' : 'body'; s.parentNode.removeChild(s); });
      document.documentElement.lang = d.documentElement.lang || 'pt-BR';
      document.head.innerHTML = d.head.innerHTML;
      document.body.innerHTML = d.body.innerHTML;
      for (var i = 0; i < d.body.attributes.length; i++) document.body.setAttribute(d.body.attributes[i].name, d.body.attributes[i].value);
      return scripts.reduce(function (p, s) { return p.then(function () { return rodar(s); }); }, Promise.resolve());
    })
    .catch(plano);
})();
