import test from 'node:test';
import assert from 'node:assert/strict';
import { getCompanionState } from '../src/lib/rsvp-companion.ts';
import { quickWishes } from '../src/lib/rsvp-wishes.ts';

test('one guest, two guests and larger groups get three distinct moods and captions', () => {
  assert.deepEqual(getCompanionState(true, 1, false), { mood: 'happy', caption: 'Có bạn là vui rồi!' });
  assert.deepEqual(getCompanionState(true, 2, false), { mood: 'paired', caption: 'Đi cùng nhau, vui gấp đôi!' });
  for (const count of [3, 4, 50]) {
    assert.deepEqual(getCompanionState(true, count, false), { mood: 'excited', caption: 'Càng đông, càng vui!' });
  }
});

test('declining, undecided and sending take precedence over the remembered guest count', () => {
  assert.equal(getCompanionState(false, 3, false).mood, 'love');
  assert.equal(getCompanionState(null, 2, false).mood, 'curious');
  assert.equal(getCompanionState(true, 1, true).mood, 'sending');
});

test('only the two requested quick wishes remain', () => {
  assert.deepEqual(quickWishes.map(wish => wish.label), ['Trăm năm hạnh phúc', 'Mãi bên nhau']);
});
