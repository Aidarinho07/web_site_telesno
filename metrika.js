// Яндекс Метрика: подключение счётчика.
// Номер счётчика задаётся в config.js (FORM_CONFIG.metrika.id).
// Пока номер пустой, файл ничего не делает.
//
// Цели отправляет script.js через trackGoal(): form_open (открыта
// форма записи) и lead_submit (заявка отправлена, выбран мессенджер).
// Создайте их в Метрике: Цели → «JavaScript-событие».
(function () {
  const cfg = window.FORM_CONFIG?.metrika || {};
  const id = Number(cfg.id);
  if (!id) return;

  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  ym(id, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: cfg.webvisor !== false,
  });
})();
