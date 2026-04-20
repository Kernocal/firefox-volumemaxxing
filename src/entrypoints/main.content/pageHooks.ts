import type { GainController } from './GainController'

export function pageHooks(engine: GainController): () => void {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLMediaElement) {
                    engine.log('debug', 'MutationObserver: media added', node.tagName)
                    engine.prepareElement(node)
                }
                else if (node instanceof Element) {
                    node.querySelectorAll<HTMLMediaElement>('audio, video').forEach(engine.prepareElement)
                }
            }
        }
    })

    const onPlaying = (e: Event) => {
        if (e.target instanceof HTMLMediaElement) {
            engine.log('debug', 'playing event for', e.target.tagName)
            engine.prepareElement(e.target)
            engine.activateBoost(e.target)
        }
    }

    const onEncrypted = (e: Event) => {
        if (e.target instanceof HTMLMediaElement)
            engine.log('debug', 'encrypted event on', e.target.tagName)
    }

    observer.observe(document.documentElement, { childList: true, subtree: true })
    document.addEventListener('playing', onPlaying, true)
    document.addEventListener('encrypted', onEncrypted, true)

    const gestureTypes = ['pointerdown', 'keydown', 'touchstart'] as const
    for (const type of gestureTypes) {
        document.addEventListener(type, engine.handleUserGesture, true)
    }

    return () => {
        observer.disconnect()
        document.removeEventListener('playing', onPlaying, true)
        document.removeEventListener('encrypted', onEncrypted, true)
        for (const type of gestureTypes) {
            document.removeEventListener(type, engine.handleUserGesture, true)
        }
    }
}
