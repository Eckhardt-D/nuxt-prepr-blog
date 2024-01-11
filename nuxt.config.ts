// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      preprUrl: ''
    }
  },

  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"]
})
