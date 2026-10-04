window.FORM_CONFIG = {
  // Отправка заявок с формы на почту (FormSubmit.co)
  // _next — страница подтверждения после успешной отправки
  email: {
    // Основной адрес (активирован в FormSubmit) — сюда уходит заявка напрямую
    endpoint: 'https://formsubmit.co/rakhimov.aydar@yandex.ru',
    // Второй получатель: FormSubmit пересылает копию письма на этот адрес
    // (обходит ограничение «подтверждённый домен» для gmail.com)
    forward: 'aida.baymukhametova@gmail.com',
    next: 'https://aidarinho07.github.io/web_site_telesno/?sent=1',
  },

  booking: {
    message: 'Здравствуйте, хочу записаться на тренинг к Аглае Датешидзе',
    vk: '412170144',
    max: 'https://max.ru/u/f9LHodD0cOL-YbWj7SKU2B9SWe9PIhrNJ-Nbiwx6v4zHyWGRqbcceXVWKBo',
  },

  contact: {
    name: 'Аида Баймухаметова',
    phone: '+7 982 987 8030',
    vk: 'https://vk.ru/id412170144',
  },
};
