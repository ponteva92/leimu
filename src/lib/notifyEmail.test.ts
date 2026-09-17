import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CONTACT_NOTIFY_EMAILS,
  DEFAULT_MAKE_WEBHOOK,
  emailPlan,
  formatDeliveryAddress,
  customerOrderSubject,
  LEIMU_INBOX,
  makeWebhookUrl,
  SHOP_NOTIFY_EMAILS,
  shouldEmailCustomer,
} from "./notifyEmail";

const pickupOrder = {
  formType: "leimu-order",
  Tilaaja: "Heikki Niemimäki",
  "Sähköposti": "heikki.niemimaki@gmail.com",
  Osoite: "",
  Postinumero: "",
  Kaupunki: "Oulu",
  Toimitus: "Nouto",
  "Kpl yhteensä": 2,
  Hinta: 18,
  "Tuotteet (erittely)": "red: Havu-Vanilja x2",
  "Viesti kuoreen": "testi",
};

const postOrder = {
  formType: "leimu-order",
  Tilaaja: "Cursor PROD unique leimuprod10rojlfve5@uberip.com",
  "Sähköposti": "leimuprod10rojlfve5@uberip.com",
  Osoite: "Testikatu 1",
  Postinumero: "90100",
  Kaupunki: "Oulu",
  Toimitus: "Posti (+8 €)",
  "Kpl yhteensä": 2,
  Hinta: 26,
  "Tuotteet (erittely)": "green: Havu x2",
  "Viesti kuoreen": "TEST unique production order Tag LEIMU-PROD-UNIQUE-ORDER-3505340",
};

const contactPayload = {
  formType: "leimu-contact",
  Nimi: "Heikki Niemimäki",
  "Sähköposti": "heikki.niemimaki@gmail.com",
  Aihe: "testi",
  Viesti: "testaana",
  Saapunut: "2026-09-16T22:03:29.093Z",
};

test("contact plan matches Outlook/Make word-for-word", () => {
  const plan = emailPlan(contactPayload);
  assert.ok(plan);
  assert.deepEqual(plan.leimu.to, [...CONTACT_NOTIFY_EMAILS]);
  assert.deepEqual(plan.leimu.to, ["leimucandles@gmail.com", "heikki.niemimaki@gmail.com"]);
  assert.equal(plan.leimu.subject, "Uusi yhteydenottopyyntö!");
  assert.equal(
    plan.leimu.text,
    [
      "Hei!",
      "",
      "Heikki Niemimäki on lähettänyt sinulle yhteydenottopyynnön 2026-09-16T22:03:29.093Z!",
      "",
      "Aihe: : testi",
      "Viesti: testaana",
      "Lähettäjä: Heikki Niemimäki",
      "Sähköposti: heikki.niemimaki@gmail.com",
    ].join("\n"),
  );
  assert.equal(plan.customer, null);
  assert.equal(shouldEmailCustomer(contactPayload), false);
});

test("pickup order copies Outlook customer + shop templates", () => {
  const plan = emailPlan(pickupOrder, { recordId: "rec8fv48DVpRtMOCe" });
  assert.ok(plan);
  assert.deepEqual(plan.leimu.to, [...SHOP_NOTIFY_EMAILS]);
  assert.deepEqual(plan.leimu.to, ["heikki.niemimaki@gmail.com", "leimucandles@gmail.com"]);
  assert.equal(
    plan.leimu.subject,
    "Uusi tilaus vastaanotettu asiakkalta Heikki Niemimäki",
  );
  assert.equal(
    plan.leimu.text,
    [
      "Uusi tilaus vastaanotettu. Tässä tilauksen tiedot jäsenneltynä:",
      "",
      "Tilaajan tiedot:",
      "Nimi: Heikki Niemimäki",
      "Sähköposti: heikki.niemimaki@gmail.com",
      "Osoite:",
      "Postinumero:",
      "Kaupunki: Oulu",
      "",
      "Tilauksen tiedot:",
      "Toimitus: Nouto",
      "Kynttilöitä yhteensä: 2 kpl",
      "Hinta: 18€",
      "",
      "Erittely:",
      "red: Havu-Vanilja x2",
      "",
      "Personoidut viestit:",
      "testi",
    ].join("\n"),
  );
  assert.ok(plan.customer);
  assert.equal(plan.customer.to, "heikki.niemimaki@gmail.com");
  assert.equal(plan.customer.subject, "Tilausvahvistus LEIMU Candles, rec8fv48DVpRtMOCe");
  assert.equal(
    plan.customer.text,
    [
      "Hei Heikki Niemimäki,",
      "",
      "Kiitos paljon tilauksestasi – arvostamme sitä suuresti! Tässä on vahvistus tilauksesi tiedoista:",
      "",
      "Toimitustiedot:",
      "Nimi: Heikki Niemimäki",
      "Sähköposti: heikki.niemimaki@gmail.com",
      "Toimitusosoite: , Oulu",
      "Toimitustapa: Nouto",
      "",
      "Tilauksen yhteenveto:",
      "Kynttilöitä yhteensä: 2 kpl",
      "Yhteishinta: 18€",
      "",
      "Tilauksen erittely:",
      "red: Havu-Vanilja x2",
      "",
      "Personoidut viestit:",
      "testi",
      "",
      "Jos jokin yllä olevista tiedoista kaipaa korjausta tai haluat lisätä jotakin, voit lähettää sähköpostia osoitteeseen: leimucandles@gmail.com.",
      "",
      "Lämpimin terveisin,",
      "LEIMU Candles",
    ].join("\n"),
  );
  assert.equal(shouldEmailCustomer(pickupOrder), true);
});

test("post order uses street, zip, city in Toimitusosoite", () => {
  const plan = emailPlan(postOrder, { recordId: "recXylA5MxFh4ZwYx" });
  assert.ok(plan?.customer);
  assert.equal(formatDeliveryAddress(postOrder), "Testikatu 1, 90100 Oulu");
  assert.match(plan.customer.text, /Toimitusosoite: Testikatu 1, 90100 Oulu/);
  assert.match(plan.customer.text, /Toimitustapa: Posti \(\+8 €\)/);
  assert.match(plan.customer.text, /Yhteishinta: 26€/);
  assert.match(plan.leimu.text, /Osoite: Testikatu 1\nPostinumero: 90100\nKaupunki: Oulu/);
  assert.match(plan.leimu.text, /Hinta: 26€/);
  assert.equal(
    plan.customer.subject,
    "Tilausvahvistus LEIMU Candles, recXylA5MxFh4ZwYx",
  );
});

test("customer subject omits record id when Make/Airtable id is unknown", () => {
  assert.equal(customerOrderSubject(), "Tilausvahvistus LEIMU Candles");
  assert.equal(customerOrderSubject("recABC"), "Tilausvahvistus LEIMU Candles, recABC");
  const plan = emailPlan(pickupOrder);
  assert.equal(plan?.customer?.subject, "Tilausvahvistus LEIMU Candles");
});

test("makeWebhookUrl always uses the live Make hook", () => {
  const prev = process.env.MAKE_WEBHOOK_URL;
  process.env.MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/5spqx7tbh2xnjujp6af9agg5dj4pohke";
  assert.equal(makeWebhookUrl(), DEFAULT_MAKE_WEBHOOK);
  process.env.MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/some-other-hook";
  assert.equal(makeWebhookUrl(), DEFAULT_MAKE_WEBHOOK);
  if (prev === undefined) delete process.env.MAKE_WEBHOOK_URL;
  else process.env.MAKE_WEBHOOK_URL = prev;
  assert.equal(LEIMU_INBOX, "leimucandles@gmail.com");
});
