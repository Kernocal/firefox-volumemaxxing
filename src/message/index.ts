import { defineExtensionMessaging } from '@webext-core/messaging'

interface Protocol {
    getVolume: (tabId: number) => number | undefined
    setVolume: (data: { tabId: number, volume: number }) => void
    getCurrentTabVolume: () => number | undefined
    resetVolume: (tabId: number) => void
    applyVolume: (volume: number) => void
    reset: () => void
}

export const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>()
