const copy = {
  zh: { navHow:'玩法',navDownload:'下载',eyebrow:'一场写在草稿纸上的数学混战',heroTitle:'把数字<br><em>算到零。</em>',heroLead:'数字正在逼近。移动、瞄准、开火，用减法、除法、开方与取模，把每个敌人一步步化为零。',getGame:'获取游戏',watchDemo:'观看实机演示',available:'适用于',annotation:'目标：归零！',demoKicker:'实机画面',videoCaption:'用一个数字，改写另一个数字的命运。',howKicker:'游戏公式',howTitle:'四种运算，<br>无限种解法。',howIntro:'每一发子弹都是一个数字。切换运算符，选择恰好的时机，让敌人的数值归零。波次越高，数字越大，挑战也越难。',subtract:'减法',subtractDesc:'直接削减数字，最可靠的起手式。',divide:'除法',divideDesc:'把庞大的数字快速压低。',sqrt:'开方',sqrtDesc:'逐步逼近一，再给出最后一击。',modulo:'取模',moduloDesc:'用余数创造意想不到的捷径。',featureOne:'✳ 手绘草稿纸世界',featureTwo:'✳ 每波三选一升级',featureThree:'✳ 越算越上头',downloadKicker:'开始演算',downloadTitle:'准备好<br>归零了吗？',downloadText:'免费下载桌面版。选一个系统，拿起你的铅笔。',macFormat:'通用版 · DMG',winFormat:'64 位 · 安装程序',footer:'用一点数学，换一点快乐。'},
  en: { navHow:'How to play',navDownload:'Download',eyebrow:'A mathematical brawl on graph paper',heroTitle:'Make every<br><em>number zero.</em>',heroLead:'The numbers are closing in. Move, aim, and fire subtraction, division, square roots, and modulo to bring every enemy down to zero.',getGame:'Get the game',watchDemo:'Watch gameplay',available:'Available for',annotation:'Goal: zero!',demoKicker:'Gameplay',videoCaption:'One number can change the fate of another.',howKicker:'The formula',howTitle:'Four operations.<br>Endless solutions.',howIntro:'Every bullet carries a number. Switch operations and choose the right moment to bring enemies to zero. Higher waves bring bigger numbers and harder choices.',subtract:'Subtract',subtractDesc:'Reduce numbers directly. Your reliable first move.',divide:'Divide',divideDesc:'Bring big numbers down quickly.',sqrt:'Square root',sqrtDesc:'Work toward one, then land the final hit.',modulo:'Modulo',moduloDesc:'Find surprising shortcuts in the remainder.',featureOne:'✳ Hand-drawn graph paper world',featureTwo:'✳ Choose an upgrade after each wave',featureThree:'✳ A little math, a lot of momentum',downloadKicker:'Start calculating',downloadTitle:'Ready to<br>hit zero?',downloadText:'Download the desktop game for free. Pick your platform and grab a pencil.',macFormat:'Universal · DMG',winFormat:'64-bit · Installer',footer:'A little math goes a long way.'}
};
function setLanguage(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = copy[lang][el.dataset.i18n]; });
  document.querySelector('#language').textContent = lang === 'zh' ? 'EN' : '中文';
  document.title = lang === 'zh' ? 'MathGame — 把数字算到零' : 'MathGame — Make Every Number Zero';
  localStorage.setItem('mathgame-language', lang);
}
const initial = localStorage.getItem('mathgame-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
setLanguage(initial);
document.querySelector('#language').addEventListener('click', () => setLanguage(document.documentElement.lang === 'zh-CN' ? 'en' : 'zh'));
document.querySelector('#year').textContent = new Date().getFullYear();
fetch('https://api.github.com/repos/bennix/MathGame/releases/latest').then(response => response.ok ? response.json() : null).then(release => {
  if (!release) return;
  const patterns = { mac: /\.dmg$/i, win: /\.exe$/i, deb: /\.deb$/i, rpm: /\.rpm$/i };
  Object.entries(patterns).forEach(([platform, pattern]) => {
    const asset = release.assets.find(item => pattern.test(item.name));
    if (asset) document.querySelector(`[data-platform="${platform}"]`).href = asset.browser_download_url;
  });
}).catch(() => {});
