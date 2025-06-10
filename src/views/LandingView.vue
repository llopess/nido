<template>
  <v-container
    fluid
    class="fill-height d-flex flex-column align-center justify-center px-4 py-8 landing-container"
  >
    <div class="content-wrapper">
      <h1
        class="main-title text-h3 sm:text-h2 md:text-h1 font-weight-bold text-primary mb-4 text-center text-wrap"
      >
        Nido
      </h1>
      <p class="tagline text-h6 sm:text-h5 text-medium-emphasis mb-8 text-center text-wrap">
        Gerencie as finanças do seu lar de forma simples e colaborativa.
      </p>

      <v-btn
        color="primary"
        size="x-large"
        to="/auth"
        class="px-8 py-4 text-button font-weight-bold elevation-8 hover:elevation-12 transition-all duration-300"
      >
        Comece Agora!
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const cozyBgUrl = new URL('/cozy-bg.png', import.meta.url).href

const themeConfig = {
  nidoThemeLight: {
    backgroundImage: `url("${cozyBgUrl}")`,
    opacity: 0.2,
  },
  nidoThemeDark: {
    backgroundImage: `url("${cozyBgUrl}")`,
    opacity: 0.4,
  },
}

onMounted(() => {
  watch(
    () => theme.global.name.value,
    (newThemeName) => {
      // Correção: Adiciona asserção de tipo para 'newThemeName'
      const config =
        themeConfig[newThemeName as keyof typeof themeConfig] || themeConfig.nidoThemeLight
      const container = document.querySelector('.landing-container')
      if (container) {
        ;(container as HTMLElement).style.setProperty('--bg-image', config.backgroundImage)
        ;(container as HTMLElement).style.setProperty('--bg-opacity', config.opacity.toString())
      }
    },
    { immediate: true },
  )
})
</script>

<style scoped>
.landing-container {
  height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  position: relative;
  overflow: hidden;
  background-color: var(--v-theme-colors-background);
}

.landing-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: var(--bg-opacity);
  z-index: 0;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 16px;
  width: 100%;
}

.main-title {
  font-size: 3.5rem;
  line-height: 1.1;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: var(--v-theme-colors-primary);
}

.tagline {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  color: var(--v-theme-colors-text-medium-emphasis);
}

.text-wrap {
  white-space: normal !important;
  word-break: normal !important;
}

@media (max-width: 600px) {
  .main-title {
    font-size: 2.5rem;
  }
  .tagline {
    font-size: 1.25rem;
  }
}
@media (max-width: 400px) {
  .main-title {
    font-size: 2rem;
  }
  .tagline {
    font-size: 1rem;
  }
}
</style>
