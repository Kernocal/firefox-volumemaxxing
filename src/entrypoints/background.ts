import { browser, storage } from '#imports'
import { backgroundLogger } from '@/logger'
import { onMessage } from '@/message'

export default defineBackground(() => {
    const tabVolumes = storage.defineItem<Record<number, number>>('session:tabVolumes', { fallback: {} })

    onMessage('getVolume', async ({ data: tabId }) => {
        const volumes = await tabVolumes.getValue()
        return volumes[tabId]
    })

    onMessage('setVolume', async ({ data }) => {
        const volumes = await tabVolumes.getValue()
        volumes[data.tabId] = data.volume
        await tabVolumes.setValue(volumes)
        backgroundLogger.debug(`Tab ${data.tabId} volume → ${data.volume}%`)
    })

    onMessage('resetVolume', async ({ data: tabId }) => {
        const volumes = await tabVolumes.getValue()
        delete volumes[tabId]
        await tabVolumes.setValue(volumes)
        backgroundLogger.debug(`Tab ${tabId} volume reset`)
    })

    onMessage('getCurrentTabVolume', async ({ sender }) => {
        const tabId = sender.tab?.id
        if (tabId == null)
            return undefined
        const volumes = await tabVolumes.getValue()
        return volumes[tabId]
    })

    browser.tabs.onRemoved.addListener(async (tabId) => {
        const volumes = await tabVolumes.getValue()
        delete volumes[tabId]
        await tabVolumes.setValue(volumes)
    })
})
