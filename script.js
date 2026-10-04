const DEFAULT_BOOKING_MESSAGE =
  'Здравствуйте, хочу записаться на тренинг к Аглае Датешидзе';

const MOBILE_RE = /Android|iPhone|iPad|iPod|Mobile/i;

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('registration-modal');
  const toast = document.getElementById('booking-toast');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  let toastTimer;

  function getBookingConfig() {
    return window.FORM_CONFIG?.booking || {};
  }

  function getBookingMessage() {
    const cfg = getBookingConfig();
    return cfg.message || DEFAULT_BOOKING_MESSAGE;
  }

  function buildMessengerLinks() {
    const cfg = getBookingConfig();
    const message = encodeURIComponent(getBookingMessage());
    const links = {};

    if (cfg.vk) {
      const vkId = String(cfg.vk).replace(/\D/g, '');
      if (vkId) {
        links.vk = `https://vk.com/im?sel=${vkId}&msg=${message}`;
      }
    }

    if (cfg.tg) {
      const tgRaw = String(cfg.tg).trim();
      let tgUrl;

      if (/^https?:\/\//i.test(tgRaw)) {
        tgUrl = tgRaw.replace(/\/$/, '');
      } else {
        const tgUsername = tgRaw.replace(/^@/, '');
        if (tgUsername) {
          tgUrl = `https://t.me/${tgUsername}`;
        }
      }

      if (tgUrl) {
        links.tg = `${tgUrl}/${encodeURIComponent(getBookingMessage())}`;
      }
    }

    if (cfg.max) {
      const maxRaw = String(cfg.max).trim();
      let maxUrl;

      if (/^https?:\/\//i.test(maxRaw)) {
        maxUrl = maxRaw.replace(/\/$/, '');
      } else {
        const maxSlug = maxRaw.replace(/^\/+/, '').replace(/\/$/, '');
        if (maxSlug && maxSlug !== ':share') {
          maxUrl = `https://max.ru/${maxSlug}`;
        }
      }

      if (maxUrl) {
        links.max = maxUrl;
      }
    }

    return links;
  }

  function updateMessengerLinks() {
    const links = buildMessengerLinks();

    document.querySelectorAll('[data-messenger]').forEach((btn) => {
      const key = btn.dataset.messenger;
      const href = links[key];

      if (href) {
        btn.href = href;
        btn.hidden = false;
        btn.dataset.webHref = href;
      } else {
        btn.hidden = true;
        btn.removeAttribute('href');
        delete btn.dataset.webHref;
      }
    });
  }

  async function copyBookingMessage() {
    const text = getBookingMessage();

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }

      document.body.removeChild(textarea);
      return copied;
    }
  }

  function showBookingToast(copied) {
    if (!toast) return;

    toast.textContent = copied
      ? 'Текст скопирован — вставьте его в поле сообщения и отправьте'
      : 'Откройте чат и отправьте: «Здравствуйте, хочу записаться на тренинг…»';
    toast.hidden = false;
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.hidden = true;
    }, 4500);
  }

  function openMessengerLink(url) {
    if (MOBILE_RE.test(navigator.userAgent)) {
      window.location.href = url;
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  let pendingMessengerUrl = null;

  async function finalizeMessengerRedirect() {
    if (!pendingMessengerUrl) return;
    const url = pendingMessengerUrl;
    pendingMessengerUrl = null;
    const copied = await copyBookingMessage();
    closeModal();
    showBookingToast(copied);
    openMessengerLink(url);
  }

  function handleMessengerClick(event) {
    const btn = event.currentTarget;
    const url = btn.dataset.webHref || btn.getAttribute('href');
    if (!url) return;

    event.preventDefault();

    // Сначала проверяем форму: без заполненных полей кнопка не работает
    if (!validateBookingForm()) return;

    const values = getFormValues();

    // Мобильные браузеры уничтожают незавершённые сетевые запросы и
    // скрипты страницы, как только переход уводит во внешний протокол
    // (t.me / vk / max → мессенджер или App Store). Поэтому на мобильной
    // версии сначала отправляем заявку через FormSubmit и ЖДЁМ ответа
    // (FormSubmit отвечает редиректом — событие load означает, что
    // запрос обработан сервером), и только потом уходим в чат.
    // На ПК этот же код отрабатывает мгновенно: новая вкладка не
    // выгружает страницу, письмо уходит в фоне.
    if (values && MOBILE_RE.test(navigator.userAgent)) {
      pendingMessengerUrl = url;
      const guard = setTimeout(finalizeMessengerRedirect, 2500);
      sendBookingEmailOnce(values, () => {
        clearTimeout(guard);
        finalizeMessengerRedirect();
      });
      return;
    }

    if (values) {
      try {
        sendBookingEmailMain(values);
      } catch {
        // заявка всё равно уходит, переход не блокируем
      }
    }

    // обычный путь (ПК): отправка в фоне + немедленный переход
    (async () => {
      const copied = await copyBookingMessage();
      closeModal();
      showBookingToast(copied);
      openMessengerLink(url);
    })();
  }

  // ===== Booking form =====
  const bookingForm = document.getElementById('booking-form');
  const formError = document.getElementById('form-error');

  function getFormValues() {
    if (!bookingForm) return null;
    const data = new FormData(bookingForm);
    return {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      email: String(data.get('email') || '').trim(),
    };
  }

  function validateBookingForm() {
    const values = getFormValues();
    if (!values) return true;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email);
    const phoneDigits = values.phone.replace(/\D/g, '');
    const valid = values.name.length >= 2 && phoneDigits.length >= 10 && emailOk;

    if (formError) formError.hidden = valid;
    bookingForm.classList.toggle('has-error', !valid);
    return valid;
  }

  // Основной канал приёма заявок: письма через FormSubmit.co.
  // ВАЖНО: FormSubmit не доставляет письма, пока каждый адрес получателя
  // не активирован переходом по ссылке из первого «письма-активации»
  // (проверьте входящие и Спам на обеих почтах). После активации письма
  // приходят на все адреса из config.js.
  // Отправка выполняется синхронным submit() скрытой формы в iframe —
  // запрос гарантированно стартует до перехода в мессенджер даже на
  // мобильных браузерах (в отличие от фонового fetch).
  function buildEmailFields(values) {
    return {
      _subject: 'Заявка на тренинг «Отношения: тяни, толкай»',
      _template: 'table',
      _captcha: 'false',
      Имя: values.name,
      Телефон: values.phone,
      Почта: values.email,
      Событие: 'Тренинг «Отношения: тяни, толкай», 20–21 октября 2026, Тюмень',
    };
  }

  function postToFormSubmit(addr, fields, frameId, onDone) {
    let frame = document.getElementById(frameId);
    if (!frame) {
      frame = document.createElement('iframe');
      frame.name = frameId;
      frame.id = frameId;
      frame.style.position = 'absolute';
      frame.style.width = '1px';
      frame.style.height = '1px';
      frame.style.border = '0';
      frame.style.opacity = '0';
      frame.setAttribute('aria-hidden', 'true');
      document.body.appendChild(frame);
    }

    if (typeof onDone === 'function') {
      // FormSubmit после приёма заявки отвечает редиректом на страницу
      // «Thank you» — событие load в iframe означает, что сервер принял
      // заявку и письмо поставлено в очередь.
      frame.addEventListener('load', () => onDone(), { once: true });
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${addr}`;
    form.target = frameId;

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  // Ожидание подтверждения от FormSubmit перед уходом в мессенджер
  // используется только на мобильных (см. handleMessengerClick).
  function sendBookingEmailOnce(values, onDone) {
    const cfg = window.FORM_CONFIG?.email;
    if (!cfg) {
      onDone && onDone();
      return;
    }

    const recipients = Array.isArray(cfg.recipients) ? cfg.recipients : [];
    if (!recipients.length) {
      onDone && onDone();
      return;
    }

    const fields = buildEmailFields(values);
    let pending = recipients.length;
    const doneOne = () => {
      pending -= 1;
      if (pending <= 0 && onDone) onDone();
    };

    recipients.forEach((addr, i) => {
      postToFormSubmit(addr, fields, `booking-mail-frame-${i}`, doneOne);
    });
  }

  function sendBookingEmailMain(values) {
    const cfg = window.FORM_CONFIG?.email;
    if (!cfg) return;

    const recipients = Array.isArray(cfg.recipients) && cfg.recipients.length
      ? cfg.recipients
      : [];

    const fields = buildEmailFields(values);

    recipients.forEach((addr, i) => {
      postToFormSubmit(addr, fields, `booking-mail-frame-${i}`);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('input', () => {
      if (bookingForm.classList.contains('has-error')) validateBookingForm();
    });
  }

  function openModal() {
    updateMessengerLinks();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.querySelectorAll('[data-messenger]').forEach((btn) => {
    btn.addEventListener('click', handleMessengerClick);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow =
      window.scrollY > 20 ? '0 4px 20px rgba(61, 43, 31, 0.08)' : 'none';
  });

  initLeadReveal();
  initPrepAccordion();
});

function initPrepAccordion() {
  document.querySelectorAll('.prep-accordion').forEach((accordion) => {
    const trigger = accordion.querySelector('.prep-accordion__trigger');
    const panel = accordion.querySelector('.prep-accordion__panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      panel.setAttribute('aria-hidden', String(!isOpen));
    });
  });
}

function initLeadReveal() {
  const elements = document.querySelectorAll('.for-whom__lead, .reveal-accent');
  if (!elements.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  elements.forEach((element) => {
    if (reducedMotion) {
      element.classList.add('is-visible');
      return;
    }

    const section = element.closest('section');
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  });
}
