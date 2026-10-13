import { terms, lessonCount, reviewQuestions } from './learning/curriculum.js';
import './style.css';

const app = document.querySelector('#game');
const key = 'math-adventure-progress-v2';
const icons = ['🧭', '⚡', '🌿', '🔭', '🏆'];
const stages = terms.flatMap((term, ti) => [...term.lessons.map((lesson, li) => ({ ...lesson, ti, li })), { title: '期末复习', module: '综合挑战', ti, li: 9, review: true }]);
let unlocked = Math.min(stages.length, Math.max(0, Number(localStorage.getItem(key)) || 0));
let termIndex = Math.min(4, Math.floor(unlocked / 10));
let stageIndex = null, questionIndex = 0, answered = false, mistakes = 0, sound = true;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const questions = stage => stage.review ? reviewQuestions(terms[stage.ti]) : stage.questions;
const progress = () => unlocked;

function tone(ok) {
  if (!sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.value = ok ? 660 : 240;
    gain.gain.setValueAtTime(.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .2);
    osc.onended = () => ctx.close();
  } catch { /* Audio is optional. */ }
}

function frame(content) {
  app.innerHTML = `<div class="world"><header class="topbar"><button class="brand" data-action="home" aria-label="返回关卡地图"><span class="brand-mark">✦</span><span>数学冒险岛<small>一关一关，玩懂数学</small></span></button><div class="top-progress"><span>冒险进度</span><div class="progress-track"><div style="width:${Math.round(progress() / lessonCount * 100)}%"></div></div><strong>${progress()} / ${lessonCount}</strong></div><button class="sound-button" data-action="sound" aria-label="切换音效">${sound ? '🔊' : '🔇'}</button></header>${content}</div>`;
}

function map() {
  stageIndex = null;
  document.title = '数学冒险岛 · 关卡地图';
  const term = terms[termIndex];
  const cards = [...term.lessons, { title: '期末复习', module: '综合挑战', review: true }].map((lesson, li) => {
    const index = termIndex * 10 + li, done = index < unlocked, open = index <= unlocked;
    return `<button class="level-card ${done ? 'done' : ''} ${open ? 'open' : 'locked'} ${lesson.review ? 'review' : ''}" data-level="${index}" ${open ? '' : 'disabled'}><span class="level-number">${lesson.review ? '★' : String(li + 1).padStart(2, '0')}</span><span class="level-copy"><span class="level-category">${lesson.module}</span><strong>${esc(lesson.title)}</strong><small>${done ? '✓ 已完成' : open ? '▶ 开始闯关' : '🔒 待解锁'}</small></span><span class="level-arrow">${open ? '↗' : '·'}</span></button>`;
  }).join('');
  frame(`<main class="map"><section class="hero"><div class="hero-copy"><span class="eyebrow">A7 数学探索旅程</span><h1>把知识变成<br><em>一场冒险！</em></h1><p>点一点、试一试，答错也能继续探索。<br>从熟悉的数字开始，逐关发现数学的秘密。</p><div class="hero-actions"><button class="primary-button" data-level="${Math.min(unlocked, stages.length - 1)}">${unlocked === stages.length ? '重玩最终关' : '继续冒险'}　→</button><span class="hero-count">已点亮 <b>${progress()}</b> 颗知识星</span></div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="hero-star star-one">✦</span><span class="hero-star star-two">✳</span><span class="hero-sum">2 + 3 <span>=</span> 5</span><div class="planet">✦</div><span class="hero-pencil">✏️</span></div></section><div class="section-heading"><div><span class="eyebrow">选择学期</span><h2>冒险地图</h2></div><span class="section-note">每学期 9 个主题关 + 1 个复习关</span></div><nav class="term-tabs" aria-label="学期">${terms.map((t, i) => `<button class="term-tab ${i === termIndex ? 'active' : ''}" data-term="${i}"><span>${icons[i]}</span>${t.name}</button>`).join('')}</nav><section class="term-panel" style="--term-color:${term.color}"><div class="term-header"><div><span class="term-kicker">${icons[termIndex]}　${term.name}</span><h3>${term.subtitle}</h3></div><span>${Math.min(10, Math.max(0, unlocked - termIndex * 10))} / 10 已通关</span></div><div class="level-grid">${cards}</div></section><footer>跟着自己的节奏，勇敢试错，每一步都算进步 ✦</footer></main>`);
}

function question() {
  const stage = stages[stageIndex], set = questions(stage), item = set[questionIndex];
  answered = false;
  document.title = `${stage.title} · 数学冒险岛`;
  frame(`<main class="play"><div class="play-nav"><button class="back-button" data-action="home">← 返回地图</button><span>${terms[stage.ti].name} · 第 ${stage.li + 1} 关</span></div><section class="challenge"><div class="challenge-top"><span class="challenge-icon">${stage.review ? '🏆' : icons[stage.ti]}</span><div><span class="eyebrow">${esc(stage.module)} · ${questionIndex === 0 ? '发现规律' : questionIndex === set.length - 1 ? '过关挑战' : '动手试试'}</span><h1>${esc(stage.title)}</h1></div><span class="question-counter">${questionIndex + 1} / ${set.length}</span></div><div class="step-dots">${set.map((_, i) => `<span class="${i < questionIndex ? 'done' : i === questionIndex ? 'active' : ''}"></span>`).join('')}</div><div class="question-area"><div class="question-tag">思考一下 ✦</div><h2>${esc(item.prompt)}</h2><p>点击答案卡，或把它拖进答案星球。</p><div class="answer-zone" id="answer-zone">把答案送到这里 <span>✦</span></div><div class="choices">${item.choices.map((choice, i) => `<button class="choice" draggable="true" data-choice="${i}"><span class="choice-symbol">${['A', 'B', 'C'][i]}</span><strong>${esc(choice)}</strong><span class="choice-handle">⠿</span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"></div></div></section><div class="play-tip">💡 答错没关系，看看提示，再试一次。</div></main>`);
  document.querySelectorAll('.choice').forEach(button => button.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', button.dataset.choice)));
  const zone = document.querySelector('#answer-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('hover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('hover'); answer(Number(e.dataTransfer.getData('text/plain'))); });
}

function answer(choice) {
  if (stageIndex === null || answered || !Number.isInteger(choice)) return;
  const item = questions(stages[stageIndex])[questionIndex], buttons = [...document.querySelectorAll('.choice')];
  if (choice < 0 || choice >= buttons.length) return;
  const feedback = document.querySelector('#feedback');
  if (choice !== item.answer) {
    mistakes++; tone(false);
    buttons[choice].classList.add('incorrect');
    feedback.className = 'feedback visible try-again';
    feedback.innerHTML = `<strong>再试一次！</strong><span>${esc(item.tip)}</span>`;
    setTimeout(() => buttons[choice]?.classList.remove('incorrect'), 700);
    return;
  }
  answered = true; tone(true);
  buttons[choice].classList.add('correct');
  buttons.forEach(button => button.disabled = true);
  feedback.className = 'feedback visible success';
  feedback.innerHTML = `<strong>答对啦！ ✨</strong><span>${esc(item.tip)}</span><button class="next-button" data-action="next">${questionIndex + 1 === questions(stages[stageIndex]).length ? '领取过关星星' : '下一题'} →</button>`;
}

function next() {
  if (!answered || stageIndex === null) return;
  const stage = stages[stageIndex];
  if (questionIndex + 1 < questions(stage).length) { questionIndex++; question(); return; }
  if (stageIndex === unlocked && unlocked < stages.length) { unlocked++; localStorage.setItem(key, String(unlocked)); }
  frame(`<main class="victory"><div class="victory-spark" aria-hidden="true">✦　✧　✦</div><div class="victory-medal">★</div><span class="eyebrow">关卡完成</span><h1>${esc(stage.title)}，通关！</h1><p>${mistakes ? '你认真尝试、学会了新方法！' : '你一次就找到了所有答案！'}<br>一颗新的知识星已经点亮。</p><div class="victory-actions"><button class="primary-button" data-level="${Math.min(stageIndex + 1, stages.length - 1)}">${stageIndex === stages.length - 1 ? '重玩最终关' : `下一关：${esc(stages[stageIndex + 1].title)}`} →</button><button class="secondary-button" data-action="home">返回地图</button></div></main>`);
}

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action], [data-term], [data-level], [data-choice]');
  if (!target) return;
  if (target.dataset.action === 'home') map();
  else if (target.dataset.action === 'sound') { sound = !sound; target.textContent = sound ? '🔊' : '🔇'; }
  else if (target.dataset.action === 'next') next();
  else if (target.dataset.term !== undefined) { termIndex = Number(target.dataset.term); map(); }
  else if (target.dataset.level !== undefined) { const i = Number(target.dataset.level); if (i <= unlocked) { stageIndex = i; termIndex = Math.floor(i / 10); questionIndex = 0; mistakes = 0; question(); } }
  else if (target.dataset.choice !== undefined) answer(Number(target.dataset.choice));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && stageIndex !== null) map();
  if (event.key === 'Enter' && answered && event.target === document.body) next();
  const number = Number(event.key);
  if (stageIndex !== null && number >= 1 && number <= 3) answer(number - 1);
});
map();
