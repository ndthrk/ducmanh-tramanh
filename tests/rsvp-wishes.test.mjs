import test from 'node:test';
import assert from 'node:assert/strict';
import { appendQuickWish, quickWishes } from '../src/lib/rsvp-wishes.ts';

test('quick wishes preserve a personal message and append on a new line', () => {
  assert.equal(appendQuickWish('Lời chúc riêng của mình ♥', quickWishes[0].text), `Lời chúc riêng của mình ♥\n${quickWishes[0].text}`);
});

test('quick wishes fill an empty message and do not duplicate repeated clicks', () => {
  const first = appendQuickWish('', quickWishes[0].text);
  assert.equal(first, quickWishes[0].text);
  assert.equal(appendQuickWish(first, quickWishes[0].text), first);
  assert.equal(appendQuickWish('  ', quickWishes[0].text), first);
});

test('different quick wishes can be combined without replacing previous content', () => {
  const combined = appendQuickWish(quickWishes[0].text, quickWishes[1].text);
  assert.equal(combined, `${quickWishes[0].text}\n${quickWishes[1].text}`);
});

test('quick wishes never truncate existing content or exceed the field limit', () => {
  const message = 'a'.repeat(995);
  assert.equal(appendQuickWish(message, quickWishes[0].text), message);
  assert.equal(appendQuickWish('a'.repeat(997), '♥♥'), `${'a'.repeat(997)}\n♥♥`);
});
