export type LogLevel = 'silly' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type Log = (level: LogLevel, ...args: unknown[]) => void

export interface LogPayload {
    level: LogLevel
    args: string[]
}

declare global {
    interface HTMLMediaElement {
        captureStream?: () => MediaStream
        mozCaptureStream?: () => MediaStream
    }
}

export {}
