// Яндекс Метрика: счётчик и цели формы записи.
// Номер счётчика задаётся в config.js (FORM_CONFIG.metrika.counterId).
// Пока номер пустой, файл ничего не делает.
//
// Цели (создайте их в Метрике: Цели → «JavaScript-событие»):
//   form_open   — открыта форма записи (любая кнопка data-open-modal)
//   form_submit — форма заполнена верно и нажата кнопка мессенджера
//                 (в этот момент script.js отправляет заявку)
//
// Файл не меняет script.js: он слушает клики на уровне document,
// уже после обработчиков script.js. Если при редизайне поменяются
// атрибуты data-open-modal / data-messenger или id booking-form,
// поправьте селекторы ниже.
(function () {
  const cfg = window.FORM_CONFIG?.metrika || {};
  const id = Number(cfg.counterId);
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

  function goal(name, params) {
    try {
      ym(id, 'reachGoal', name, params);
    } catch {
      // аналитика не должна ломать сайт
    }
  }

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('[data-open-modal]')) {
      goal('form_open');
      return;
    }

    const messenger = target.closest('[data-messenger]');
    if (messenger) {
      // script.js уже проверил форму: при ошибке у неё класс has-error
      const form = document.getElementById('booking-form');
      if (form && form.classList.contains('has-error')) return;
      goal('form_submit', { messenger: messenger.dataset.messenger });
    }
  });
})();
