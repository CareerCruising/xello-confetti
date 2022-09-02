import Worker from './bake.worker'
import { ConfettiParticleFrame } from 'types'
import { MAX_FRAMES } from '../consts'
import { ConfettiParticle } from '../Scene/ConfettiParticle'
import { Vector3 } from 'three'

function getRandomVector (): Vector3 {
  const getRandomDimension = () => Math.ceil(Math.random() * 100)/250
  const xDimension = getRandomDimension() * (Math.random() > 0.5 ? -0.8 : 0.8)
  const yDimension = ((1 / ((Math.abs(xDimension) < 0.15 ? 0.15 : Math.abs(xDimension)))) / 5) * getRandomDimension() * 1.25
  return new Vector3(xDimension, yDimension, getRandomDimension() * 0.35)
}

export class Baker {
  private worker = new (Worker as any)() as Worker
  private screenFrameBuffer: ConfettiParticleFrame[][] = [[]]
  public ready = false
  
  public start (): void {
    if (this.latestScreenFrame) {
      this.worker.addEventListener('message', (event: MessageEvent) => this.commit(event.data))
      this.fetch(this.latestScreenFrame)
    } else {
      throw Error('Baker - There is no initial frame to work with!')
    }
  }

  public stop (): void {
    this.worker.terminate()
    this.screenFrameBuffer = [[]]
  }

  public fetch (buffer: ConfettiParticleFrame[]): void {
    this.worker.postMessage(buffer)
  }

  public getScreenFrame (frame: number): ConfettiParticleFrame[] {
    return this.screenFrameBuffer[frame]
  }

  public get latestScreenFrame(): ConfettiParticleFrame[] {
    return this.screenFrameBuffer[this.screenFrameBuffer.length - 1]
  }

  public addParticleToAnimation (particle: ConfettiParticle) {
    this.latestScreenFrame.push({
      meshId: particle.uuid,
      vector: getRandomVector(),
      frame: {
        position: {
          x: particle.position.x,
          y: particle.position.y,
          z: particle.position.z
        },
        rotation: {
          x: particle.rotation.x,
          y: particle.rotation.y,
          z: particle.rotation.z
        },
        flags: {
          remove: false
        }
      }
    })
  }

  private commit(newFrames: ConfettiParticleFrame[][]): void {
    if (this.screenFrameBuffer.length <= MAX_FRAMES) {
      this.worker.postMessage(newFrames[newFrames.length - 1])

      if (this.screenFrameBuffer.length > 100) {
        this.ready = true
      }
    }

    this.screenFrameBuffer = this.screenFrameBuffer.concat(newFrames)
  }
}