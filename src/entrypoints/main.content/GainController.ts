import type { Log } from '@/types'
import { installMessaging } from './messaging'
import { pageHooks } from './pageHooks'
import { patchPrototypes } from './patchPrototype'

interface PreparedState {
    stream: MediaStream
    drm: boolean
    originalVolume: number
}

interface GainEntry {
    ctx: AudioContext
    gain: GainNode
}

export class GainController {
    private prepared = new WeakMap<HTMLMediaElement, PreparedState>()
    private boosted = new WeakMap<HTMLMediaElement, GainEntry>()
    private allBoosted = new Set<HTMLMediaElement>()
    private pendingActivation = new Set<HTMLMediaElement>()
    private contexts = new Set<AudioContext>()
    private currentVolume = 100
    private hadUserGesture = false
    private disposers: Array<() => void> = []
    private started = false

    constructor(readonly log: Log) {}

    start() {
        if (this.started)
            return
        this.started = true

        this.disposers.push(
            patchPrototypes(this),
            pageHooks(this),
            installMessaging(this),
        )

        this.log('info', 'inject script loaded')
    }

    destroy() {
        this.reset()
        this.started = false
        while (this.disposers.length > 0)
            this.disposers.pop()?.()
    }

    reset() {
        let restoreVolume = 0
        for (const el of this.allBoosted) {
            const original = this.prepared.get(el)?.originalVolume ?? 0.06767
            if (original > restoreVolume)
                restoreVolume = original
        }
        for (const el of this.allBoosted)
            el.volume = restoreVolume || 0.06767
        for (const ctx of this.contexts)
            void ctx.close().catch(() => {})
        this.prepared = new WeakMap()
        this.boosted = new WeakMap()
        this.allBoosted.clear()
        this.contexts.clear()
        this.pendingActivation.clear()
        this.currentVolume = 100
        this.log('info', 'reset: engine state cleared')
    }

    prepareElement = (el: HTMLMediaElement) => {
        if (this.prepared.has(el))
            return

        try {
            const capture = el.captureStream?.bind(el) ?? el.mozCaptureStream?.bind(el)
            if (!capture) {
                this.log('warn', 'prepare: no captureStream API')
                return
            }

            const stream = capture()
            const state: PreparedState = { stream, drm: false, originalVolume: el.volume }
            this.prepared.set(el, state)

            this.log('info', 'prepare: stream captured for', el.tagName, 'tracks =', stream.getTracks().length)

            const tryActivate = () => this.activateBoost(el)
            el.addEventListener('playing', tryActivate, { capture: true })
            el.addEventListener('canplay', tryActivate, { capture: true })
            stream.addEventListener('addtrack', () => {
                this.log('debug', 'stream addtrack, audio tracks =', stream.getAudioTracks().length)
                tryActivate()
            })

            if (!el.paused)
                tryActivate()
        }
        catch {
            this.log('warn', 'prepare: captureStream failed')
        }
    }

    activateBoost = (el: HTMLMediaElement) => {
        if (this.boosted.has(el)) {
            this.applyOutput(el)
            return
        }

        if (!this.hadUserGesture) {
            this.pendingActivation.add(el)
            return
        }

        const state = this.prepared.get(el)
        if (!state)
            return

        if (state.stream.getAudioTracks().length === 0) {
            this.log('debug', 'activate: no audio tracks yet, waiting')
            return
        }

        try {
            const ctx = new AudioContext()
            const source = ctx.createMediaStreamSource(state.stream)
            const gain = ctx.createGain()
            gain.gain.value = this.currentVolume / 100

            source.connect(gain)
            gain.connect(ctx.destination)

            const entry: GainEntry = { ctx, gain }
            this.boosted.set(el, entry)
            this.allBoosted.add(el)
            this.contexts.add(ctx)

            ctx.addEventListener('statechange', () => {
                this.log('debug', 'ctx statechange →', ctx.state)
                this.applyOutput(el)
            })

            void ctx.resume().catch(() => {})
            this.applyOutput(el)
            this.log('debug', 'activate: boost active for', el.tagName, 'ctx.state =', ctx.state)
        }
        catch (err) {
            this.log('warn', 'activate: failed:', err)
        }
    }

    applyOutput = (el: HTMLMediaElement) => {
        const entry = this.boosted.get(el)
        if (!entry) {
            el.volume = Math.min(this.currentVolume / 100, 1)
            return
        }

        if (entry.ctx.state !== 'running') {
            this.log('debug', 'applyOutput: ctx not running, state =', entry.ctx.state)
            return
        }

        const gainValue = this.currentVolume / 100
        entry.gain.gain.value = gainValue
        el.volume = 0
        this.log('debug', 'applyOutput: gain =', gainValue)
    }

    updateAll = () => {
        this.log('debug', 'updateAll: boosted =', this.allBoosted.size)
        for (const el of this.allBoosted) {
            this.applyOutput(el)
        }
        document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((el) => {
            if (!this.boosted.has(el))
                el.volume = Math.min(this.currentVolume / 100, 1)
        })
    }

    markDrm = (el: HTMLMediaElement) => {
        const state = this.prepared.get(el)
        if (state)
            state.drm = true
    }

    resumeElementContext = (el: HTMLMediaElement) => {
        const entry = this.boosted.get(el)
        if (!entry)
            return
        void entry.ctx.resume().catch(err => this.log('warn', 'resumeElementContext: failed:', err))
    }

    handleUserGesture = () => {
        if (!this.hadUserGesture) {
            this.hadUserGesture = true
            for (const el of this.pendingActivation) {
                this.activateBoost(el)
            }
            this.pendingActivation.clear()
        }
        const suspended = [...this.contexts].filter(ctx => ctx.state === 'suspended')
        if (suspended.length === 0)
            return
        this.log('debug', 'unlockAllContexts: resuming', suspended.length, 'context(s)')
        void Promise.all(suspended.map(ctx => ctx.resume().catch(err => this.log('warn', 'unlockAllContexts: failed:', err))))
        this.updateAll()
    }

    get volume() {
        return this.currentVolume
    }

    set volume(value: number) {
        this.currentVolume = Math.max(0, Math.min(600, value))
        this.log('info', 'setVolume:', this.currentVolume)
        this.updateAll()
    }
}
