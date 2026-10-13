import test from 'node:test';
import assert from 'node:assert/strict';
import { terms, lessonCount, reviewQuestions } from '../src/learning/curriculum.js';

test('A7 outline has five complete terms and fifty stages', () => {
  assert.deepEqual(terms.map(term => term.name), ['Term A', 'Term B', 'Term C', 'Term D', 'Term E']);
  assert.deepEqual(terms.map(term => term.lessons.length), [9, 9, 9, 9, 9]);
  assert.equal(lessonCount, 50);
});

test('each topic has six answerable, distinct challenges and each review has nine', () => {
  for (const term of terms) for (const lesson of term.lessons) {
    assert.equal(lesson.questions.length, 6, lesson.title);
    assert.equal(new Set(lesson.questions.map(item => item.prompt)).size, 6, lesson.title);
    for (const item of lesson.questions) {
      assert.equal(item.choices.length, 3, lesson.title);
      assert.equal(new Set(item.choices).size, 3, lesson.title);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 3, lesson.title);
      assert.ok(item.tip.length > 0, lesson.title);
    }
  }
  for (const term of terms) assert.equal(reviewQuestions(term).length, 9, term.name);
});
