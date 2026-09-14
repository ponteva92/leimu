import assert from "node:assert/strict";
import { test } from "node:test";
import { calcPrice, flattenCart, priceOrder } from "./scents";
import type { CartItem } from "../types";

test("calcPrice uses the volume table then +9", () => {
  assert.equal(calcPrice(0), 0);
  assert.equal(calcPrice(1), 9);
  assert.equal(calcPrice(3), 25);
  assert.equal(calcPrice(5), 40);
  assert.equal(calcPrice(6), 47);
  assert.equal(calcPrice(7), 56);
});

test("priceOrder rejects empty, unknown scent, and bad qty", () => {
  assert.equal(priceOrder([], "pickup").ok, false);
  assert.equal(priceOrder([{ scentId: "nope", jarColor: "white", qty: 1 }], "pickup").ok, false);
  assert.equal(priceOrder([{ scentId: "havu", jarColor: "white", qty: 0 }], "pickup").ok, false);
});

test("priceOrder adds postage and optional env discount", () => {
  const base = priceOrder([{ scentId: "havu", jarColor: "white", qty: 2 }], "pickup");
  assert.equal(base.ok, true);
  if (base.ok) assert.equal(base.total, 18);

  const post = priceOrder([{ scentId: "havu", jarColor: "white", qty: 2 }], "post");
  assert.equal(post.ok, true);
  if (post.ok) assert.equal(post.total, 26);

  const bad = priceOrder(
    [{ scentId: "havu", jarColor: "white", qty: 2 }],
    "pickup",
    "LEIMU29",
    { discountCode: "LEIMU29", discountPercent: 15 },
  );
  assert.equal(bad.ok, true);
  if (bad.ok) {
    assert.equal(bad.codeApplied, true);
    assert.equal(bad.discountAmount, Math.floor(18 * 0.15));
    assert.equal(bad.total, 18 - Math.floor(18 * 0.15));
  }

  const wrong = priceOrder(
    [{ scentId: "havu", jarColor: "white", qty: 1 }],
    "pickup",
    "NOPE",
    { discountCode: "LEIMU29", discountPercent: 15 },
  );
  assert.equal(wrong.ok, false);
});

test("flattenCart expands jar lines", () => {
  const cart: CartItem[] = [
    { id: "1", jarColor: "green", quantities: { havu: 2, vanilja: 1 } },
  ];
  const lines = flattenCart(cart);
  assert.equal(lines.length, 2);
  assert.equal(lines.reduce((s, l) => s + l.qty, 0), 3);
});
