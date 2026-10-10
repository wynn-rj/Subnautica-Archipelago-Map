// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "@nuxtjs/tailwindcss"],
  compatibilityDate: "2026-10-10",
  ssr: true,
});