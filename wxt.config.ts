import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: '__MSG_extension_name__',
        description: '__MSG_extension_description__',
        default_locale: 'en',
        permissions: [
            'tabs',
            'storage',
        ],
        browser_specific_settings: {
            gecko: {
                id: 'volumemaxxing@kernocal',
                data_collection_permissions: {
                    required: ['none'],
                },
            },
        },
    },
    zip: {
        excludeSources: ['store/**'],
    },
    manifestVersion: 3,
    srcDir: 'src',
    browser: 'firefox',
    modules: ['@wxt-dev/unocss', '@wxt-dev/module-svelte', '@wxt-dev/i18n/module', '@wxt-dev/auto-icons'],
    autoIcons: {
        baseIconPath: 'assets/icon.png',
    },
    webExt: {
        binaries: {
            firefox: 'C:/Program Files/Mozilla Firefox/firefox.exe',
        },
        keepProfileChanges: true,
    },
})
