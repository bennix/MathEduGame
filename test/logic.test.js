import test from 'node:test';
import assert from 'node:assert/strict';
import { applyOperation } from '../src/logic/math.js';
import { wavePlan, enemyStats } from '../src/logic/waves.js';
import { chooseUpgrades } from '../src/logic/upgrades.js';

test('all weapons can reduce a number to zero', () => {
  assert.equal(applyOperation(3, 'subtract', 3), 0);
  assert.equal(applyOperation(1, 'divide', 2), 1);
  assert.equal(applyOperation(1, 'divide', 2, 'floor'), 0);
  assert.equal(applyOperation(0, 'sqrt', 2), 0);
  assert.equal(applyOperation(1, 'sqrt', 2), 0);
  assert.equal(applyOperation(6, 'modulo', 3), 0);
  assert.equal(applyOperation(1, 'modulo', 3), 0);
});
test('rounding choices produce distinct results', () => {
  assert.equal(applyOperation(7, 'divide', 2, 'round'), 4);
  assert.equal(applyOperation(7, 'divide', 2, 'floor'), 3);
  assert.equal(applyOperation(7, 'divide', 2, 'keep'), 3.5);
});
test('waves grow while larger numbers move more slowly', () => {
  assert.ok(wavePlan(3).count > wavePlan(2).count);
  assert.ok(wavePlan(3).max > wavePlan(2).max);
  assert.ok(enemyStats(25).speed < enemyStats(4).speed);
  assert.ok(enemyStats(25).radius > enemyStats(4).radius);
});
test('upgrade choice excludes already unlocked one-time upgrades', () => {
  const state = { split: true, unlocked: new Set(['subtract', 'divide', 'sqrt', 'modulo']) };
  const choices = chooseUpgrades(state, 20, () => 0.5);
  assert.ok(choices.every(choice => choice.id !== 'split' && !choice.id.startsWith('unlock-')));
});
