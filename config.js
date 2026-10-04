window.FORM_CONFIG = {
  // Приём заявок: письма через FormSubmit.co.
  // ВАЖНО: при первой заявке на каждый адрес ниже придёт письмо
  // «Confirm your email» от FormSubmit — нужно один раз перейти по
  // ссылке из него (проверьте и Входящие, и Спам). Без активации
  // письма не доставляются.
  email: {
    recipients: [
      'rakhimov.aydar@yandex.ru',
      'aida.baymukhametova@gmail.com',
    ],
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
