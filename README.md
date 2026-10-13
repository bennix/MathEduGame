# 数学冒险岛

面向数学初学者的分关互动游戏。课程按照 A7 大纲分为 Term A–E，每学期九个知识主题和一个期末复习关，共 50 关。每个主题关有 6 道题，期末复习关有 9 道题。孩子可以点击或拖动答案卡，答错会得到解释并继续尝试；通关后自动解锁下一关。进度保存在当前设备的浏览器本地存储中。

## 运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

构建网页版：`npm run build`。本地检查：`npm test`。桌面版可用 `npm start` 启动，安装包使用 `npm run dist:mac`、`npm run dist:win` 或 `npm run dist:linux` 构建。

推送到 `main` 后，GitHub Pages 工作流会发布 [Landing Page](site/index.html)，并把游戏放在 `/play/`。桌面安装包发布到 [MathEduGame Releases](https://github.com/bennix/MathEduGame/releases)。

macOS DMG 需由 Developer ID 签名，在本机使用已存入钥匙串的 notarytool 配置提交公证，然后 staple 并验证。Linux 提供 x64 DEB、RPM；Windows 提供 x64 NSIS 安装程序。

## 主要文件

- `src/learning/curriculum.js`：五学期课程与题目。
- `src/main.js`：关卡地图、答题、反馈、进度。
- `src/style.css`：响应式界面。
- `site/`：Landing Page。
