import Phaser from 'phaser';
import { applyOperation, WEAPONS } from '../logic/math.js';
import { wavePlan, enemyStats } from '../logic/waves.js';
import { chooseUpgrades } from '../logic/upgrades.js';

const INK = 0x34312e, PAPER = '#f1e8cf';
const font = '"Comic Sans MS", "Chalkboard SE", cursive';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  create() {
    this.size = { width: this.scale.width, height: this.scale.height };
    this.paper = this.add.graphics().setDepth(-10);
    this.drawPaper();
    this.scale.on('resize', this.onResize, this);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,ESC,ONE,TWO,THREE,FOUR,F11');
    this.keys.F11.on('down', () => window.desktop?.toggleFullscreen());
    this.keys.ESC.on('down', () => this.togglePause());
    for (let i = 0; i < 4; i++) this.keys[['ONE','TWO','THREE','FOUR'][i]].on('down', () => this.selectWeapon(i));
    this.input.on('pointerdown', (pointer, targets) => { if (this.phase === 'playing' && targets.length === 0) this.shoot(pointer); });
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.player = this.add.container(0, 0);
    this.playerArt = this.add.graphics(); this.player.add(this.playerArt);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(12, -12, -12).setCollideWorldBounds(true);
    this.physics.add.overlap(this.player, this.enemies, this.touchEnemy, undefined, this);
    this.hud = this.add.text(18, 14, '', { fontFamily: font, fontSize: '20px', color: '#34312e', stroke: PAPER, strokeThickness: 4 }).setDepth(20);
    this.hint = this.add.text(18, 44, 'WASD 移动 · 鼠标瞄准/射击 · 1–4 切换武器 · ESC 暂停 · F11 全屏', { fontFamily: font, fontSize: '14px', color: '#71695d' }).setDepth(20);
    this.toolbar = this.add.container(0, 0).setDepth(40).setVisible(false);
    this.overlay = this.add.container(0, 0).setDepth(100);
    this.highestWave = 0;
    window.desktop?.readSave().then(save => { this.highestWave = save.highestWave || 0; });
    this.showMenu();
  }
  drawPaper() {
    const { width: w, height: h } = this.size;
    this.paper.clear().fillStyle(0xf1e8cf).fillRect(0, 0, w, h);
    this.paper.lineStyle(1, 0xa9b7bd, .28);
    for (let x = 0; x < w; x += 32) this.paper.lineBetween(x, 0, x, h);
    for (let y = 0; y < h; y += 32) this.paper.lineBetween(0, y, w, y);
    this.paper.lineStyle(2, 0xd78b80, .35).lineBetween(75, 0, 75, h);
    this.physics.world.setBounds(0, 0, w, h);
  }
  onResize(size) { this.size = { width: size.width, height: size.height }; this.drawPaper(); this.updateToolbar(); if (this.phase !== 'playing' && this.phase !== 'rest') this.showCurrentOverlay(); }
  clearOverlay() { this.overlay.removeAll(true); }
  text(x, y, content, size = 24, color = '#34312e') { return this.add.text(x, y, content, { fontFamily: font, fontSize: `${size}px`, color, align: 'center' }).setOrigin(.5); }
  button(y, label, action) {
    const t = this.text(this.size.width / 2, y, `✎  ${label}  ✎`, 25).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => t.setColor('#c95147')).on('pointerout', () => t.setColor('#34312e')).on('pointerdown', action);
    this.overlay.add(t); return t;
  }
  showCurrentOverlay() { if (this.phase === 'menu') this.showMenu(); else if (this.phase === 'paused') this.showPause(); else if (this.phase === 'gameover') this.showGameOver(); }
  showMenu() {
    this.phase = 'menu'; this.clearOverlay(); this.toolbar.setVisible(false);
    const cx = this.size.width / 2, cy = this.size.height / 2;
    this.overlay.add(this.text(cx, cy - 150, 'MATH GAME', 56));
    this.overlay.add(this.text(cx, cy - 95, '把数字算到零', 22, '#756b61'));
    this.button(cy - 15, '开始游戏', () => this.startGame());
    const names = { round: '四舍五入', floor: '向下取整', keep: '保留两位小数' };
    this.button(cy + 45, `设置：${names[this.rounding || 'round']}`, () => this.cycleRounding());
    if (window.desktop) this.button(cy + 105, '退出', () => window.desktop.quit());
  }
  cycleRounding() { const modes = ['round', 'floor', 'keep']; this.rounding = modes[(modes.indexOf(this.rounding || 'round') + 1) % modes.length]; this.showMenu(); }
  startGame() {
    this.clearOverlay(); this.enemies.clear(true, true); this.bullets.clear(true, true);
    this.state = { health: 3, maxHealth: 3, speed: 220, power: 3, fireDelay: 330, split: false, pierce: 0, splash: 0, unlocked: new Set(['subtract']) };
    this.score = 0; this.wave = 0; this.weapon = WEAPONS[0]; this.lastShot = 0; this.lastDamage = 0;
    this.player.setPosition(this.size.width / 2, this.size.height / 2).setVisible(true);
    this.toolbar.setVisible(true); this.updateToolbar();
    this.phase = 'rest'; this.nextWave();
  }
  nextWave() {
    this.wave++; this.phase = 'rest'; this.remaining = 0; this.toolbar.setVisible(true);
    const plan = wavePlan(this.wave); this.remaining = plan.count;
    this.announce(`第 ${this.wave} 波`, 1100);
    this.time.delayedCall(1200, () => {
      if (this.phase !== 'rest') return;
      this.phase = 'playing';
      this.spawnEvent = this.time.addEvent({ delay: plan.spawnDelay, repeat: plan.count - 1, callback: () => this.spawnEnemy(plan) });
    });
  }
  announce(message, duration = 700) { const t = this.text(this.size.width / 2, this.size.height * .28, message, 42, '#c95147').setDepth(30); this.tweens.add({ targets: t, alpha: 0, y: t.y - 35, duration, onComplete: () => t.destroy() }); }
  spawnEnemy(plan) {
    const { width: w, height: h } = this.size;
    const side = Phaser.Math.Between(0, 3);
    const x = side === 0 ? 25 : side === 1 ? w - 25 : Phaser.Math.Between(25, w - 25);
    const y = side === 2 ? 25 : side === 3 ? h - 25 : Phaser.Math.Between(25, h - 25);
    const value = Phaser.Math.Between(plan.min, plan.max), stats = enemyStats(value);
    const enemy = this.add.container(x, y); enemy.value = value; enemy.speed = stats.speed; enemy.radius = stats.radius;
    enemy.art = this.add.graphics(); enemy.label = this.text(0, 0, `${value}`, Math.max(24, Math.min(42, stats.radius * 1.4)));
    enemy.add([enemy.art, enemy.label]); this.paintEnemy(enemy);
    this.physics.add.existing(enemy); enemy.body.setCircle(stats.radius, -stats.radius, -stats.radius);
    this.enemies.add(enemy);
  }
  paintEnemy(enemy) {
    const r = enemy.radius, g = enemy.art; g.clear().fillStyle(0xf8f1dd, .9).fillCircle(0, 0, r);
    g.lineStyle(2, INK, .9).strokeCircle(0, 0, r).lineStyle(1, INK, .5).strokeCircle(2, -1, r - 2);
    enemy.label.setText(Number.isInteger(enemy.value) ? `${enemy.value}` : enemy.value.toFixed(2));
  }
  selectWeapon(index) { if (!this.state) return; const candidate = WEAPONS[index]; if (this.state.unlocked.has(candidate.id)) { this.weapon = candidate; this.updateToolbar(); this.announce(candidate.name, 450); } }
  updateToolbar() {
    if (!this.toolbar || !this.state) return;
    this.toolbar.removeAll(true);
    const cell = Math.min(135, (this.size.width - 24) / 4), left = (this.size.width - cell * 4) / 2;
    WEAPONS.forEach((weapon, index) => {
      const unlocked = this.state.unlocked.has(weapon.id), active = this.weapon.id === weapon.id;
      const x = left + cell * index, y = this.size.height - 66;
      const box = this.add.graphics();
      box.fillStyle(active ? 0xfff6db : 0xe8dfc9, .96).fillRoundedRect(x + 3, y, cell - 6, 54, 9);
      box.lineStyle(active ? 3 : 1, active ? weapon.color : INK, active ? 1 : .45).strokeRoundedRect(x + 3, y, cell - 6, 54, 9);
      const label = this.text(x + cell / 2, y + 26, unlocked ? `${index + 1}  ${weapon.symbol}  ${weapon.name}` : `${index + 1}  🔒`, 17, unlocked ? '#34312e' : '#8c8376');
      const hit = this.add.zone(x + cell / 2, y + 27, cell - 6, 54).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => { if (unlocked && this.phase === 'playing') this.selectWeapon(index); });
      this.toolbar.add([box, label, hit]);
    });
  }
  shoot(pointer) {
    if (this.time.now - this.lastShot < this.state.fireDelay) return;
    this.lastShot = this.time.now;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    for (const offset of (this.state.split ? [-.22, 0, .22] : [0])) this.fireBullet(angle + offset);
    this.tone(660, .035);
  }
  fireBullet(angle) {
    let bullet = this.bullets.children.entries.find(item => !item.active);
    if (!bullet) {
      if (this.bullets.children.size >= 140) return;
      bullet = this.add.container(0, 0);
      bullet.label = this.text(0, 0, '', 30).setFontStyle('bold').setStroke(PAPER, 3); bullet.add(bullet.label);
      this.physics.add.existing(bullet); this.bullets.add(bullet);
    }
    bullet.setPosition(this.player.x + Math.cos(angle) * 22, this.player.y + Math.sin(angle) * 22);
    bullet.setActive(true).setVisible(true).setAlpha(1); bullet.body.enable = true;
    bullet.weapon = this.weapon.id; bullet.power = this.state.power; bullet.hitsLeft = 1 + this.state.pierce; bullet.hitIds = new Set();
    bullet.label.setText(`${bullet.power}`).setColor(`#${this.weapon.color.toString(16).padStart(6, '0')}`);
    bullet.body.setCircle(12, -12, -12).setVelocity(Math.cos(angle) * 650, Math.sin(angle) * 650);
    bullet.expires = this.time.now + 1150;
  }
  hitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active || bullet.hitIds.has(enemy)) return;
    bullet.hitIds.add(enemy); this.operate(enemy, bullet.weapon, bullet.power);
    if (this.state.splash) this.enemies.children.iterate(other => {
      if (other?.active && other !== enemy && Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) < enemy.radius + other.radius + this.state.splash) this.operate(other, bullet.weapon, bullet.power);
    });
    bullet.hitsLeft--; if (bullet.hitsLeft <= 0) this.releaseBullet(bullet);
  }
  operate(enemy, weapon, power) {
    if (!enemy.active) return;
    enemy.value = applyOperation(enemy.value, weapon, power, this.rounding || 'round');
    this.tone(290, .05); this.burst(enemy.x, enemy.y, enemy.value <= 0 ? 12 : 4, 0xc95147);
    if (enemy.value <= 0) {
      enemy.setActive(false); enemy.destroy(); this.score += 10; this.remaining--;
      if (this.remaining === 0 && this.phase === 'playing') this.time.delayedCall(650, () => this.showUpgrade());
    } else {
      this.paintEnemy(enemy); this.tweens.add({ targets: enemy, scaleX: 1.18, scaleY: 1.18, yoyo: true, duration: 100 });
    }
  }
  releaseBullet(bullet) { bullet.body.stop().setEnable(false); bullet.setActive(false).setVisible(false); }
  burst(x, y, count, color) { for (let i = 0; i < count; i++) { const dot = this.add.circle(x, y, Phaser.Math.Between(2, 4), color); const a = Math.random() * Math.PI * 2, d = Phaser.Math.Between(15, 45); this.tweens.add({ targets: dot, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, duration: 280, onComplete: () => dot.destroy() }); } }
  touchEnemy() { if (this.phase !== 'playing' || this.time.now - this.lastDamage < 900) return; this.lastDamage = this.time.now; this.state.health--; this.tweens.add({ targets: this.player, alpha: .25, yoyo: true, repeat: 3, duration: 90 }); if (this.state.health <= 0) this.endGame(); }
  showUpgrade() {
    if (this.phase !== 'playing') return;
    this.phase = 'upgrade'; this.physics.pause(); this.clearOverlay(); this.toolbar.setVisible(false); this.tone(880, .14);
    const cx = this.size.width / 2, cy = this.size.height / 2;
    this.overlay.add(this.text(cx, cy - 160, '选一个升级', 42));
    const options = chooseUpgrades(this.state);
    options.forEach((upgrade, i) => {
      const y = cy - 65 + i * 90;
      const title = this.text(cx, y, `${i + 1}. ${upgrade.title}`, 27).setInteractive({ useHandCursor: true });
      title.on('pointerover', () => title.setColor('#c95147')).on('pointerout', () => title.setColor('#34312e'));
      title.on('pointerdown', () => { upgrade.apply(this.state); this.updateToolbar(); this.clearOverlay(); this.physics.resume(); this.nextWave(); });
      this.overlay.add([title, this.text(cx, y + 29, upgrade.description, 17, '#74685c')]);
    });
  }
  togglePause() { if (this.phase === 'playing') { this.phase = 'paused'; if (this.spawnEvent) this.spawnEvent.paused = true; this.physics.pause(); this.toolbar.setVisible(false); this.showPause(); } else if (this.phase === 'paused') { this.phase = 'playing'; if (this.spawnEvent) this.spawnEvent.paused = false; this.clearOverlay(); this.toolbar.setVisible(true); this.physics.resume(); } }
  showPause() { this.clearOverlay(); const cy = this.size.height / 2; this.overlay.add(this.text(this.size.width / 2, cy - 100, '已暂停', 44)); this.button(cy, '继续', () => this.togglePause()); this.button(cy + 65, '返回菜单', () => this.returnMenu()); }
  returnMenu() { this.spawnEvent?.remove(); this.physics.resume(); this.enemies.clear(true, true); this.bullets.clear(true, true); this.player.setVisible(false); this.showMenu(); }
  endGame() { this.phase = 'gameover'; this.spawnEvent?.remove(); this.physics.pause(); this.player.setVisible(false); this.toolbar.setVisible(false); this.highestWave = Math.max(this.highestWave, this.wave); window.desktop?.writeSave({ highestWave: this.highestWave }); this.showGameOver(); }
  showGameOver() { this.clearOverlay(); const cx = this.size.width / 2, cy = this.size.height / 2; this.overlay.add(this.text(cx, cy - 130, '演算结束', 48)); this.overlay.add(this.text(cx, cy - 55, `得分 ${this.score} · 本局第 ${this.wave} 波 · 最高第 ${this.highestWave} 波`, 22)); this.button(cy + 35, '再来一次', () => { this.physics.resume(); this.startGame(); }); this.button(cy + 100, '返回菜单', () => this.returnMenu()); }
  tone(frequency, duration) { try { const ctx = this.sound.context, osc = ctx.createOscillator(), gain = ctx.createGain(); osc.frequency.value = frequency; osc.type = 'triangle'; gain.gain.setValueAtTime(.025, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration); } catch { /* audio may be unavailable */ } }
  update(time) {
    if (this.phase !== 'playing') return;
    const s = this.state, dx = Number(this.keys.D.isDown) - Number(this.keys.A.isDown), dy = Number(this.keys.S.isDown) - Number(this.keys.W.isDown);
    const length = Math.hypot(dx, dy) || 1; this.player.body.setVelocity(dx / length * s.speed, dy / length * s.speed);
    this.player.setRotation(0); this.drawPlayer(time);
    if (this.input.activePointer.isDown) this.shoot(this.input.activePointer);
    this.enemies.children.iterate(enemy => { if (!enemy?.active) return; const a = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y); enemy.body.setVelocity(Math.cos(a) * enemy.speed, Math.sin(a) * enemy.speed); });
    this.bullets.children.iterate(bullet => { if (bullet?.active && (time > bullet.expires || bullet.x < -30 || bullet.y < -30 || bullet.x > this.size.width + 30 || bullet.y > this.size.height + 30)) this.releaseBullet(bullet); });
    this.hud.setText(`第 ${this.wave} 波   ♥ ${s.health}/${s.maxHealth}   ${this.weapon.name} ${s.power}   得分 ${this.score}`);
  }
  drawPlayer(time) {
    const g = this.playerArt, aim = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
    const walking = this.player.body.speed > 5 ? Math.sin(time / 90) * 5 : 0;
    g.clear().lineStyle(3, INK).strokeCircle(0, -20, 8).lineBetween(0, -12, 0, 10).lineBetween(0, 10, -9 + walking, 24).lineBetween(0, 10, 9 - walking, 24);
    g.lineBetween(0, -6, Math.cos(aim) * 18, -6 + Math.sin(aim) * 18).lineBetween(0, -6, -Math.cos(aim) * 10, -6 - Math.sin(aim) * 10);
  }
}
