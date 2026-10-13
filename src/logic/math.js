export const ROUNDING = 'round'; // 'round' | 'floor' | 'keep'
export const WEAPONS = [
  { id: 'subtract', name: '减法', symbol: '−', color: 0xc95147, unlockWave: 0 },
  { id: 'divide', name: '除法', symbol: '÷', color: 0x4a83a5, unlockWave: 2 },
  { id: 'sqrt', name: '开方', symbol: '√', color: 0x738b4e, unlockWave: 3 },
  { id: 'modulo', name: '取模', symbol: '%', color: 0x9b6b9d, unlockWave: 4 }
];
export function applyOperation(current, weapon, power, rounding = ROUNDING) {
  let result;
  switch (weapon) {
    case 'subtract': result = current - power; break;
    case 'divide': result = current / Math.max(2, power); break;
    case 'sqrt': result = current <= 1 ? 0 : Math.sqrt(current); break;
    case 'modulo': result = current <= 1 ? 0 : current % Math.max(2, power); break;
    default: throw new Error(`Unknown weapon: ${weapon}`);
  }
  if (rounding === 'floor') return Math.floor(result);
  if (rounding === 'keep') return Number(result.toFixed(2));
  return Math.round(result);
}
