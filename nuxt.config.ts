// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "@nuxtjs/tailwindcss"],
  compatibilityDate: "2026-10-10",
  ssr: false,
  nitro: {
    preset: 'github-pages',
  },
  hooks: {
    'nitro:init'(nitro) {
      nitro.hooks.hook('error' as any, (error: any) => {
        console.error('NITRO ERROR DETAILS:', error)
        console.error(error.stack)
      })
    }
  }
});