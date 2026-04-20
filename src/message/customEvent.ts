import type { LogPayload } from '@/types'
import { defineCustomEventMessaging } from '@webext-core/messaging/page'

interface CustomEventProtocol {
    setVolume: (volume: number) => void
    reset: () => void
    log: (payload: LogPayload) => void
}

export const websiteMessenger = defineCustomEventMessaging<CustomEventProtocol>({
    namespace: 'VOLUMEMAXXING_',
})
