document.querySelector('#year').textContent = new Date().getFullYear();

fetch('https://api.github.com/repos/bennix/MathEduGame/releases/latest')
  .then(response => response.ok ? response.json() : null)
  .then(release => {
    if (!release) return;
    const patterns = { mac: /\.dmg$/i, win: /\.exe$/i, deb: /\.deb$/i, rpm: /\.rpm$/i };
    for (const [platform, pattern] of Object.entries(patterns)) {
      const asset = release.assets.find(item => pattern.test(item.name));
      if (asset) document.querySelector(`[data-platform="${platform}"]`).href = asset.browser_download_url;
    }
  })
  .catch(() => {});
