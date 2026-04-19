import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
    presets: [presetWind4()],
    transformers: [transformerVariantGroup(), transformerDirectives()],
    theme: {
        colors: {
            surface: {
                'bg': '#202020',
                'panel': '#1a1a1a',
                'panel-hover': '#252525',
                'border': '#333333',
                'border-hover': '#444444',
            },
            accent: {
                DEFAULT: '#0078d4',
                hover: '#1a8ae8',
            },
            on: {
                'surface': '#ffffff',
                'surface-muted': '#aaaaaa',
                'surface-subtle': '#888888',
                'accent': '#ffffff',
            },
        },
    },
})
