<script lang='ts'>
    import { browser, i18n } from '#imports'
    import { onMount } from 'svelte'
    import { popupLogger } from '@/logger'
    import { sendMessage } from '@/message'

    let tabId = $state<number | null>(null)
    let volume = $state(100)

    function byVolume(safe: string, warn: string, danger: string) {
        return volume <= 100 ? safe : volume <= 300 ? warn : danger
    }

    async function onVolumeChange() {
        if (tabId === null) {
            return
        }

        await sendMessage('setVolume', { tabId, volume })
        sendMessage('applyVolume', volume, tabId)
    }

    async function onReset() {
        if (tabId === null) {
            return
        }
        await sendMessage('resetVolume', tabId)
        sendMessage('reset', undefined, tabId)
        volume = 100
    }

    onMount(async () => {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
            tabId = tab?.id ?? null
            if (tabId === null) {
                return
            }
            const tabVolume = await sendMessage('getVolume', tabId)
            volume = tabVolume ?? 100
            if (!tabVolume) {
                popupLogger.warn('No volume found on active tab', tabId)
            }
        }
        catch (err) {
            popupLogger.error('Failed to init', err)
        }
    })
</script>

<main class='text-on-surface font-sans bg-surface-bg min-w-80 select-none'>
    <header class='px-5 pb-1 pt-4 flex justify-end'>
        <a
            href='https://github.com/Kernocal/firefox-volumemaxxing/issues/new?template=website-request.md'
            target='_blank'
            rel='noopener noreferrer'
            class='text-on-surface-subtle transition-colors hover:text-on-surface'
            aria-label={i18n.t('popup.requestWebsite')}
        >
            <svg class='h-4.5 w-4.5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z' />
            </svg>
        </a>
    </header>

    {#if tabId === null}
        <div class='px-5 pb-5'>
            <p class='text-sm text-on-surface-muted'>{i18n.t('popup.noActiveTab')}</p>
        </div>
    {:else}
        <section class='px-5 pb-2'>
            <label class='flex flex-col gap-1.5'>
                <div class='flex items-baseline justify-between'>
                    <span class='text-sm text-on-surface-muted font-medium'>{i18n.t('popup.volumeLabel')}</span>
                    <span class={[
                        'text-2xl font-bold tabular-nums tracking-tight',
                        byVolume('text-vol-safe', 'text-vol-warn', 'text-vol-danger'),
                    ]}>{Math.round(volume)}<span class='text-sm text-on-surface-subtle font-medium ml-0.5'>%</span></span>
                </div>
                <input
                    type='range'
                    bind:value={volume}
                    oninput={onVolumeChange}
                    min={0}
                    max={600}
                    step={1}
                    class={[
                        'slider w-full',
                        byVolume('slider-safe', 'slider-warn', 'slider-danger'),
                    ]}
                />
            </label>
            <div class='text-2.5 text-on-surface-subtle font-medium mt-1 h-4 relative'>
                <span class='left-0 absolute'>0%</span>
                <span class='left-1/6 absolute'>100%</span>
                <span class='left-1/2 absolute -translate-x-1/2'>300%</span>
                <span class='right-0 absolute'>600%</span>
            </div>
        </section>

        <div class='px-5 pb-5 pt-2'>
            <button
                onclick={onReset}
                disabled={volume === 100}
                class='text-xs text-danger font-semibold py-2 border border-transparent rounded-lg bg-danger-muted w-full transition-colors hover:(border-danger/30 bg-danger/15) disabled:(opacity-40 cursor-not-allowed)'
            >
                {i18n.t('popup.stopButton')}
            </button>
        </div>
    {/if}
</main>

<style>
    .slider {
        appearance: none;
        height: 6px;
        border-radius: 999px;
        background: #2e2e33;
        outline: none;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #161618;
        cursor: pointer;
        transition: background 0.15s ease, box-shadow 0.15s ease;
    }

    .slider::-moz-range-track {
        height: 6px;
        border-radius: 999px;
        background: #2e2e33;
    }

    .slider-safe::-moz-range-thumb {
        background: #4ade80;
        box-shadow: 0 0 0 1px #4ade8040;
    }

    .slider-safe::-moz-range-thumb:hover {
        box-shadow: 0 0 0 4px #4ade8030;
    }

    .slider-warn::-moz-range-thumb {
        background: #facc15;
        box-shadow: 0 0 0 1px #facc1540;
    }

    .slider-warn::-moz-range-thumb:hover {
        box-shadow: 0 0 0 4px #facc1530;
    }

    .slider-danger::-moz-range-thumb {
        background: #f87171;
        box-shadow: 0 0 0 1px #f8717140;
    }
    .slider-danger::-moz-range-thumb:hover {
        box-shadow: 0 0 0 4px #f8717130;
    }
</style>
