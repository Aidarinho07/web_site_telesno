"use strict";

(function initLeadForm() {
  const FORM_ENDPOINT = window.FORM_API_ENDPOINT || "/api/feedback";
  const form = document.getElementById("leadForm");
  const notice = document.getElementById("notice");

  if (!form || !notice) {
    return;
  }

  function showNotice(text, isError) {
    notice.textContent = text;
    notice.style.display = "block";
    notice.style.borderColor = isError ? "rgba(255,92,122,.6)" : "rgba(45,226,166,.35)";
    notice.style.background = isError ? "rgba(255,92,122,.12)" : "rgba(45,226,166,.10)";
    notice.style.color = isError ? "#ffd8e0" : "#d8fff3";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    notice.style.display = "none";

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      tg: String(data.get("tg") || "").trim(),
      date: String(data.get("date") || "").trim(),
      note: String(data.get("note") || "").trim(),
      consent: Boolean(data.get("consent")),
      source: "landing"
    };

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      showNotice("Спасибо! Заявка отправлена. Мы свяжемся с вами и пришлем детали оплаты.", false);
      form.reset();
    } catch (error) {
      showNotice("Не удалось отправить заявку. Напишите нам в Telegram или попробуйте еще раз позже.", true);
    }
  });
})();
