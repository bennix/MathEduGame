const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');

let window;
function createWindow() {
  const area = screen.getPrimaryDisplay().workAreaSize;
  window = new BrowserWindow({
    width: Math.min(1280, area.width), height: Math.min(800, area.height), minWidth: 640, minHeight: 560,
    backgroundColor: '#f6f8ff', icon: path.join(__dirname, '../build/icon.png'), webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  window.setMenuBarVisibility(false);
  if (app.isPackaged) window.loadFile(path.join(__dirname, '../dist/index.html'));
  else window.loadURL('http://127.0.0.1:5173');
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
