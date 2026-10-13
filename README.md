# MathGame

Electron + Phaser 3 数学射击游戏。WASD 移动，鼠标瞄准并按住射击，1–4 或底部运算符栏切换已解锁武器。子弹直接显示数值，用颜色区分运算符。敌人数字降到 0 或以下时消灭。每波结束三选一升级。

## 运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

`npm run dev` 同时启动 Vite 和 Electron。也可用 `npm start` 构建后运行 Electron。`npm test` 运行运算、波次和升级逻辑测试。

## 平台安装包

在相应系统运行：

```bash
npm install
npm run dist:mac      # macOS 通用 DMG，需要 Developer ID 签名证书
npm run dist:win      # Windows NSIS 安装程序
npm run dist:linux    # Linux DEB 和 RPM
```

安装包输出在 `release/`。macOS DMG 还需通过 Apple 公证并 staple，才能作为已公证安装包分发。最高波次保存在 Electron 的用户数据目录 `save.json`。

推送 `v*` 标签后，[发布工作流](.github/workflows/release.yml) 在 GitHub Actions 上分别构建四种安装包；macOS 工作流签名、公证并验证 DMG。需要在仓库 Secrets 中配置 `MAC_CERTIFICATE_P12_BASE64`、`MAC_CERTIFICATE_PASSWORD`、`APPLE_ID`、`APPLE_APP_SPECIFIC_PASSWORD` 和 `APPLE_TEAM_ID`。凭据不要提交到仓库。

[Landing Page](site/index.html) 支持中英文切换，嵌入真实游戏录像。推送到 `main` 后由 [Pages 工作流](.github/workflows/pages.yml) 部署。

## 文件结构

```text
electron/main.cjs       窗口、存档和全屏 IPC
electron/preload.cjs    渲染进程安全桥接
src/main.js             Phaser 初始化
src/scenes/GameScene.js 玩法、碰撞、菜单与 HUD
src/logic/math.js       运算符和小数策略
src/logic/waves.js      波次与敌人属性
src/logic/upgrades.js   升级列表和选择
test/logic.test.js      逻辑测试
build/icon.*            各平台应用图标
site/                   双语 Landing Page 与演示影片
.github/workflows/      GitHub Pages 和跨平台发布
```
