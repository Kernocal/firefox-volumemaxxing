import type { ILogObj } from 'tslog'
import { Logger } from 'tslog'

// levels
// 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal

export const extensionLogger: Logger<ILogObj> = new Logger({
    name: 'Volumemaxxing',
    minLevel: import.meta.env.PROD && import.meta.env.MODE !== 'testing' ? 4 : 2,
    type: 'pretty',
})

export const backgroundLogger = extensionLogger.getSubLogger({ name: 'Background' })
export const popupLogger = extensionLogger.getSubLogger({ name: 'Popup' })
export const contentLogger = extensionLogger.getSubLogger({ name: 'Content' })
