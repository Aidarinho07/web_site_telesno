window.FORM_CONFIG = {
  // Основной канал приёма заявок: Getform (https://getform.io)
  // Как включить за 2 минуты:
  //   1. Зарегистрируйтесь на getform.io (можно через GitHub-аккаунт).
  //   2. Создайте форму — получите адрес вида
  //      https://getform.io/f/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  //   3. Вставьте этот адрес в endpoint ниже и задеплойте.
  // Все заявки сохраняются в панели Getform; там же можно включить
  // пересылку каждой заявки на почту (Integrations → Email), тогда
  // письма будут приходить гарантированно и без активации FormSubmit.
  getform: {
    endpoint: '', // <-- вставьте сюда адрес формы из getform.io
  },

  // Резервный канал: письма через FormSubmit.co.
  // ВАЖНО: FormSubmit не доставляет письма, пока адрес получателя не
  // подтверждён ссылкой из первого «письма-активации» (проверьте Спам).
  // Пока активация не пройдена, этот канал молчит — но заявки всё равно
  // попадают в Getform выше.
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
