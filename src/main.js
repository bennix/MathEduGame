import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import './style.css';

new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', backgroundColor: '#f1e8cf',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: window.innerWidth, height: window.innerHeight },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [GameScene], render: { antialias: true, pixelArt: false }
});

if (import.meta.env.DEV && new URLSearchParams(location.search).has('record')) import('./recording.js');
