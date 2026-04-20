import type { GainController } from './GainController'

export function patchPrototypes(engine: GainController): () => void {
    const originalSetMediaKeys = HTMLMediaElement.prototype.setMediaKeys
    const originalLoad = HTMLMediaElement.prototype.load
    const originalPlay = HTMLMediaElement.prototype.play

    HTMLMediaElement.prototype.setMediaKeys = function (this: HTMLMediaElement, ...args: Parameters<typeof originalSetMediaKeys>) {
        engine.log('debug', 'setMediaKeys intercepted — DRM for', this.tagName)
        engine.markDrm(this)
        engine.prepareElement(this)
        return originalSetMediaKeys.apply(this, args)
    }

    HTMLMediaElement.prototype.load = function (this: HTMLMediaElement) {
        engine.log('debug', 'load() intercepted for', this.tagName)
        engine.prepareElement(this)
        return originalLoad.call(this)
    }

    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
        engine.log('debug', 'play() intercepted for', this.tagName)
        engine.prepareElement(this)
        engine.resumeElementContext(this)

        const result = originalPlay.call(this)
        queueMicrotask(() => engine.activateBoost(this))
        return result
    }

    return () => {
        HTMLMediaElement.prototype.setMediaKeys = originalSetMediaKeys
        HTMLMediaElement.prototype.load = originalLoad
        HTMLMediaElement.prototype.play = originalPlay
    }
}
