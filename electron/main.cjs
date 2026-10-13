const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

let window;
function saveFile() { return path.join(app.getPath('userData'), 'save.json'); }
function createWindow() {
  const area = screen.getPrimaryDisplay().workAreaSize;
  window = new BrowserWindow({
    width: Math.min(1280, area.width), height: Math.min(800, area.height), minWidth: 800, minHeight: 560,
    backgroundColor: '#f1e8cf', icon: path.join(__dirname, '../build/icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  window.setMenuBarVisibility(false);
  if (app.isPackaged) window.loadFile(path.join(__dirname, '../dist/index.html'));
  else window.loadURL('http://127.0.0.1:5173');
}
app.whenReady().then(() => {
  ipcMain.handle('save:read', () => {
    try { return JSON.parse(fs.readFileSync(saveFile(), 'utf8')); } catch { return { highestWave: 0 }; }
  });
  ipcMain.handle('save:write', (_event, value) => {
    const highestWave = Math.max(0, Math.floor(Number(value?.highestWave) || 0));
    fs.writeFileSync(saveFile(), JSON.stringify({ highestWave }));
    return highestWave;
  });
  ipcMain.handle('window:fullscreen', () => { window.setFullScreen(!window.isFullScreen()); return window.isFullScreen(); });
  ipcMain.handle('window:quit', () => app.quit());
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
