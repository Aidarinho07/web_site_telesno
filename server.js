"use strict";

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_PATH = path.join(__dirname, "leads.db");

const EMAIL_TO = splitCsv(process.env.EMAIL_TO);
const TG_CHAT_IDS = splitCsv(process.env.TG_CHAT_IDS);
const SMS_TO = splitCsv(process.env.SMS_TO);

const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.EMAIL_FROM &&
  EMAIL_TO.length
);

const twilioConfigured = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_FROM &&
  SMS_TO.length
);

const telegramConfigured = Boolean(process.env.TG_BOT_TOKEN && TG_CHAT_IDS.length);

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      tg TEXT,
      preferred_date TEXT,
      note TEXT,
      source TEXT,
      consent INTEGER NOT NULL,
      ip TEXT,
      user_agent TEXT,
      email_status TEXT,
      telegram_status TEXT,
      sms_status TEXT
    )
  `);
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    dbPath: DB_PATH,
    channels: {
      email: smtpConfigured,
      telegram: telegramConfigured,
      sms: twilioConfigured
    }
  });
});

app.post("/api/feedback", async (req, res) => {
  const payload = sanitizePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({ ok: false, error: validationError });
  }

  const lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload,
    ip: getClientIp(req),
    userAgent: String(req.headers["user-agent"] || "")
  };

  const statuses = { email: "not_configured", telegram: "not_configured", sms: "not_configured" };

  try {
    statuses.email = await sendEmailNotification(lead);
    statuses.telegram = await sendTelegramNotification(lead);
    statuses.sms = await sendSmsNotification(lead);
  } catch (error) {
    // Per-channel functions convert most failures to status strings.
  }

  try {
    await insertLead(lead, statuses);
    return res.json({ ok: true, leadId: lead.id, statuses });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to save lead", details: error.message });
  }
});

app.get("/api/leads", async (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.headers["x-admin-token"] !== token) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const limit = Math.min(Number(req.query.limit || 50), 500);
  db.all(
    `SELECT id, created_at, name, contact, tg, preferred_date, note, source, consent, email_status, telegram_status, sms_status
     FROM leads
     ORDER BY datetime(created_at) DESC
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
      return res.json({ ok: true, items: rows });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function sanitizePayload(body) {
  return {
    name: String(body?.name || "").trim(),
    contact: String(body?.contact || "").trim(),
    tg: String(body?.tg || "").trim(),
    date: String(body?.date || "").trim(),
    note: String(body?.note || "").trim(),
    source: String(body?.source || "landing").trim(),
    consent: Boolean(body?.consent)
  };
}

function validatePayload(payload) {
  if (!payload.name) return "Поле name обязательно";
  if (!payload.contact) return "Поле contact обязательно";
  if (!payload.date) return "Поле date обязательно";
  if (!payload.consent) return "Требуется согласие на обработку данных";
  return "";
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) {
    return xff.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "";
}

function formatLeadText(lead) {
  return [
    "Новая заявка с лендинга",
    `ID: ${lead.id}`,
    `Дата: ${lead.createdAt}`,
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Telegram: ${lead.tg || "-"}`,
    `Выбранная дата: ${lead.date}`,
    `Комментарий: ${lead.note || "-"}`,
    `Источник: ${lead.source}`
  ].join("\n");
}

async function sendEmailNotification(lead) {
  if (!smtpConfigured) return "not_configured";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: EMAIL_TO.join(", "),
      subject: `Новая заявка: ${lead.name} (${lead.date})`,
      text: formatLeadText(lead),
      replyTo: lead.contact
    });

    return "sent";
  } catch (error) {
    return `failed:${error.message}`;
  }
}

async function sendTelegramNotification(lead) {
  if (!telegramConfigured) return "not_configured";

  const text = formatLeadText(lead);
  const results = await Promise.allSettled(
    TG_CHAT_IDS.map((chatId) =>
      axios.post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text
      })
    )
  );

  const failed = results.filter((x) => x.status === "rejected").length;
  if (!failed) return "sent";
  if (failed === results.length) return "failed:all_chats";
  return `partial:${results.length - failed}/${results.length}`;
}

async function sendSmsNotification(lead) {
  if (!twilioConfigured) return "not_configured";

  const smsBody = `Новая заявка: ${lead.name}, ${lead.contact}, ${lead.date}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = {
    username: process.env.TWILIO_ACCOUNT_SID,
    password: process.env.TWILIO_AUTH_TOKEN
  };

  const results = await Promise.allSettled(
    SMS_TO.map((to) =>
      axios.post(
        url,
        new URLSearchParams({
          To: to,
          From: process.env.TWILIO_FROM,
          Body: smsBody
        }),
        {
          auth,
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      )
    )
  );

  const failed = results.filter((x) => x.status === "rejected").length;
  if (!failed) return "sent";
  if (failed === results.length) return "failed:all_numbers";
  return `partial:${results.length - failed}/${results.length}`;
}

function insertLead(lead, statuses) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO leads (
        id, created_at, name, contact, tg, preferred_date, note, source, consent, ip, user_agent,
        email_status, telegram_status, sms_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead.id,
        lead.createdAt,
        lead.name,
        lead.contact,
        lead.tg,
        lead.date,
        lead.note,
        lead.source,
        lead.consent ? 1 : 0,
        lead.ip,
        lead.userAgent,
        statuses.email,
        statuses.telegram,
        statuses.sms
      ],
      (err) => {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
}
