import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_MAKE_WEBHOOK,
  emailPlan,
  LEIMU_INBOX,
  makeWebhookUrl,
  shouldEmailCustomer,
} from "./notifyEmail";

test("contact plan emails LEIMU only", () => {
  const plan = emailPlan({
    formType: "leimu-contact",
    Nimi: "Aino",
    "Sähköposti": "aino@example.com",
    Aihe: "Kynttilä",
    Viesti: "Moikka",
    Saapunut: "2026-09-16T12:00:00.000Z",
  });
  assert.ok(plan);
  assert.equal(plan.leimu.to, LEIMU_INBOX);
  assert.equal(plan.leimu.to, "leimucandles@gmail.com");
  assert.match(plan.leimu.subject, /Kynttilä/);
  assert.match(plan.leimu.text, /aino@example.com/);
  assert.equal(plan.customer, null);
});

test("makeWebhookUrl always uses the live Make hook", () => {
  const prev = process.env.MAKE_WEBHOOK_URL;
  process.env.MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/5spqx7tbh2xnjujp6af9agg5dj4pohke";
  assert.equal(makeWebhookUrl(), DEFAULT_MAKE_WEBHOOK);
  process.env.MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/some-other-hook";
  assert.equal(makeWebhookUrl(), DEFAULT_MAKE_WEBHOOK);
  if (prev === undefined) delete process.env.MAKE_WEBHOOK_URL;
  else process.env.MAKE_WEBHOOK_URL = prev;
});

test("order plan emails customer and LEIMU", () => {
  const plan = emailPlan({
    formType: "leimu-order",
    Tilaaja: "Matti Meikäläinen",
    "Sähköposti": "matti@example.com",
    Toimitus: "Nouto",
    Maksutapa: "cash",
    "Kpl yhteensä": 1,
    Hinta: 9,
    "Tuotteet (erittely)": "white: Mustikka x1",
  });
  assert.ok(plan);
  assert.equal(plan.leimu.to, "leimucandles@gmail.com");
  assert.match(plan.leimu.subject, /Matti Meikäläinen/);
  assert.ok(plan.customer);
  assert.equal(plan.customer.to, "matti@example.com");
  assert.match(plan.customer.subject, /Tilausvahvistus/);
  assert.match(plan.customer.text, /Mustikka/);
  assert.equal(shouldEmailCustomer({ formType: "leimu-order" }), true);
  assert.equal(shouldEmailCustomer({ formType: "leimu-contact" }), false);
});
