/* КурскГазПром: подключение Яндекс Метрики. Без ID скрипт ничего не загружает. */
(function () {
  'use strict';
  const cfg = window.KGP_CONFIG || {};
  const id = Number(cfg.metrikaId);
  if (!Number.isSafeInteger(id) || id <= 0) return;
  window.kgpGoal = function (goal) {
    if (typeof window.ym === 'function') window.ym(id, 'reachGoal', goal);
  };
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=Date.now();
    k=e.createElement(t);a=e.getElementsByTagName(t)[0];
    k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  window.ym(id, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false
  });
  document.addEventListener('click', function (ev) {
    const a = ev.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) window.kgpGoal('phone_click');
    else if (href.startsWith('mailto:')) window.kgpGoal('email_click');
    else if (a.classList.contains('route-action') || a.dataset.route === 'true') window.kgpGoal('route_click');
    else if (href.startsWith('https://t.me/')) window.kgpGoal('telegram_click');
  }, {passive: true});
})();
