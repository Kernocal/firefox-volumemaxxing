import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
    presets: [presetWind4()],
    transformers: [transformerVariantGroup(), transformerDirectives()],
    theme: {
        colors: {
            surface: {
                'bg': '#161618',
                'panel': '#1e1e21',
                'panel-hover': '#28282c',
                'border': '#2e2e33',
                'border-hover': '#3e3e44',
            },
            accent: {
                DEFAULT: '#6d9fff',
                hover: '#89b4ff',
                muted: '#6d9fff26',
            },
            danger: {
                DEFAULT: '#f87171',
                hover: '#fca5a5',
                muted: '#f8717126',
            },
            vol: {
                safe: '#4ade80',
                warn: '#facc15',
                danger: '#f87171',
            },
            on: {
                'surface': '#e8e8ed',
                'surface-muted': '#9d9da8',
                'surface-subtle': '#6b6b78',
                'accent': '#ffffff',
            },
        },
        font: {
            sans: 'Inter, system-ui, -apple-system, sans-serif',
        },
    },
})
