import 'phaser'
import Boot from './scenes/Boot'
import Main from './scenes/Main'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [Boot, Main]
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
