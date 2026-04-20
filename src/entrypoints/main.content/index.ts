import type { Log } from '@/types'
import { websiteMessenger } from '@/message/customEvent'
import { GainController } from './GainController'

export default defineContentScript({
    matches: ['<all_urls>'],
    world: 'MAIN',
    runAt: 'document_start',
    main() {
        const log: Log = (level, ...args) => {
            websiteMessenger.sendMessage('log', {
                level,
                args: args.map(a => String(a)),
            })
        }

        new GainController(log).start()
    },
})
