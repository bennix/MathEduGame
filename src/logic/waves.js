export function wavePlan(wave) {
  return { count: 3 + wave * 2, min: Math.max(2, wave), max: 5 + wave * 4, spawnDelay: Math.max(280, 780 - wave * 35) };
}
export function enemyStats(value) {
  return { radius: Math.min(36, 17 + Math.sqrt(value) * 2.3), speed: Math.max(20, 64 - Math.sqrt(value) * 5) };
}
