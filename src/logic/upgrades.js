export const UPGRADES = [
  { id: 'power', title: '锋利铅笔', description: '子弹数值 +1', apply: s => { s.power += 1; } },
  { id: 'fireRate', title: '快速演算', description: '射击间隔缩短 15%', apply: s => { s.fireDelay = Math.max(110, Math.round(s.fireDelay * .85)); } },
  { id: 'speed', title: '轻盈脚步', description: '移动速度 +25', apply: s => { s.speed += 25; } },
  { id: 'heal', title: '草稿修正', description: '恢复 1 点生命', apply: s => { s.health = Math.min(s.maxHealth, s.health + 1); } },
  { id: 'split', title: '分裂笔迹', description: '每次射击额外发射两颗斜向子弹', apply: s => { s.split = true; }, available: s => !s.split },
  { id: 'pierce', title: '穿透证明', description: '子弹可多击中一个敌人', apply: s => { s.pierce += 1; } },
  { id: 'range', title: '范围运算', description: '命中时对附近敌人也进行运算', apply: s => { s.splash += 12; } },
  ...['divide', 'sqrt', 'modulo'].map((id, i) => ({ id: `unlock-${id}`, title: `解锁${['除法', '开方', '取模'][i]}`, description: `按 ${i + 2} 键切换`, apply: s => { s.unlocked.add(id); }, available: s => !s.unlocked.has(id) }))
];
export function chooseUpgrades(state, count = 3, random = Math.random) {
  const pool = UPGRADES.filter(u => !u.available || u.available(state));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, count);
}
