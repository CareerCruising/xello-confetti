import './Scene/Scene'
import { ConfettiScene } from './Scene/Scene'
import { ConfettiTheme } from './types';

export class XelloConfetti extends HTMLElement {
  private mountRoot: ShadowRoot | null = null
  private scene: ConfettiScene | null = null;
  
  connectedCallback () {
    this.mountRoot = this.attachShadow({ mode: 'open' })
    this.scene = new ConfettiScene()
    this.scene.mount(this.mountRoot)
    const stylesheet = document.createElement('style')
    stylesheet.innerText = `
      @media (prefers-reduced-motion: reduce) {
        canvas {
          display: none;
        }
      }
    `
    this.mountRoot.appendChild(stylesheet)
  }

  disconnectedCallback () {
    this.scene?.kill()
  }

  public play () {
    this.clear()
    this.scene?.start()
  }

  public clear () {
    this.scene?.stop()
  }

  public setTheme (theme: Partial<ConfettiTheme>) {
    this.scene?.setTheme(theme)
  }
}

if (!customElements.get('xello-confetti')) {
  customElements.define('xello-confetti', XelloConfetti)
}
