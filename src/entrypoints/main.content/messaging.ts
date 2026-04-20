import type { GainController } from './GainController'
import { websiteMessenger } from '@/message/customEvent'

export function installMessaging(engine: GainController): () => void {
    const removeSetVolume = websiteMessenger.onMessage('setVolume', ({ data: volume }) => {
        engine.volume = volume
        document.querySelectorAll<HTMLMediaElement>('audio, video').forEach(engine.prepareElement)
    })

    const removeReset = websiteMessenger.onMessage('reset', () => {
        engine.reset()
    })

    return () => {
        removeSetVolume()
        removeReset()
    }
}
