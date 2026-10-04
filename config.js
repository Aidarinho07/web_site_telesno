window.FORM_CONFIG = {
  // Отправка заявок с формы на почту (FormSubmit.co)
  // _next — страница подтверждения после успешной отправки
  email: {
    // Отправка через FormSubmit.co. ВАЖНО: поле _forward-to у FormSubmit не работает,
    // поэтому заявка отправляется ДВУМЯ независимыми письмами — по одному эндпоинту
    // на каждого получателя. Оба адреса должны быть активированы в FormSubmit:
    // после первой отправки каждому получателю приходит письмо со ссылкой
    // подтверждения (проверить «Спам»).
    recipients: [
      'rakhimov.aydar@yandex.ru',
      'aida.baymukhametova@gmail.com',
    ],
    // Совместимость со старой версией скрипта:
    endpoint: 'https://formsubmit.co/rakhimov.aydar@yandex.ru',
    next: 'https://aidarinho07.github.io/web_site_telesno/?sent=1',
  },

  booking: {
    message: 'Здравствуйте, хочу записаться на тренинг к Аглае Датешидзе',
    vk: '412170144',
    max: 'https://max.ru/u/f9LHodD0cOL-YbWj7SKU2B9SWe9PIhrNJ-Nbiwx6v4zHyWGRqbcceXVWKBo',
    tg: '@Aida_Baimukhametova',
  },

  contact: {
    name: 'Аида Баймухаметова',
    phone: '+7 982 987 8030',
    vk: 'https://vk.ru/id412170144',
  },
};
