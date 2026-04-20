import { contentLogger } from '@/logger'
import { onMessage, sendMessage } from '@/message'
import { websiteMessenger } from '@/message/customEvent'

export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: 'document_start',
    async main() {
        onMessage('applyVolume', ({ data: volume }) => {
            websiteMessenger.sendMessage('setVolume', volume)
        })

        onMessage('reset', () => {
            websiteMessenger.sendMessage('reset')
        })

        websiteMessenger.onMessage('log', ({ data: { level, args } }) => {
            contentLogger[level]('INJECT:', ...args)
        })

        const volume = await sendMessage('getCurrentTabVolume')
        if (volume != null) {
            websiteMessenger.sendMessage('setVolume', volume)
        }
    },
})
