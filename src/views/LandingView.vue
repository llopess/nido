<template>
  <!-- O v-container ocupa a altura disponível do v-main (corpo principal do app) -->
  <v-container
    fluid
    class="fill-height d-flex flex-column align-center justify-center px-4 py-8 relative"
  >
    <!-- Camada de Fundo Visualmente Atrativo (div dedicada) -->
    <div class="landing-background-effect"></div>

    <!-- Card principal da Landing Page -->
    <v-card
      class="text-center pa-8 pa-md-12 elevation-10 rounded-xl max-w-lg w-full relative z-10"
      color="surface"
    >
      <v-card-title
        class="text-h4 sm:text-h3 md:text-h2 font-weight-bold text-primary mb-4 text-wrap"
      >
        Bem-vindo ao Nido!
      </v-card-title>
      <v-card-subtitle class="text-h6 sm:text-h5 text-medium-emphasis mb-8 text-wrap">
        Seu lar, suas finanças, tudo em um só lugar.
      </v-card-subtitle>

      <!-- Call to Action (CTA) -->
      <v-btn
        color="primary"
        size="x-large"
        to="/auth"
        class="px-8 py-4 text-button font-weight-bold elevation-8 hover:elevation-12 transition-all duration-300"
      >
        Comece Agora!
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// Nenhuma lógica específica de script é necessária aqui.
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  position: relative;
  overflow: hidden;
  background-color: var(--v-theme-colors-background);
}

.landing-background-effect {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  background-image:
    radial-gradient(circle at 15% 15%, var(--v-theme-colors-secondary) 0%, transparent 20%),
    radial-gradient(circle at 85% 85%, var(--v-theme-colors-secondary-darken-1) 0%, transparent 25%),
    radial-gradient(circle at 50% 50%, var(--v-theme-colors-primary) 0%, transparent 15%);
  
  background-repeat: no-repeat;
  background-size: 300px 300px, 400px 400px, 250px 250px;
  background-position: -80px -80px, calc(100% + 80px) calc(100% + 80px), center center;
  
  filter: blur(70px);
  opacity: 0.18;
}

/* Garante que o texto dentro de v-card-title e v-card-subtitle quebre a linha */
.v-card-title,
.v-card-subtitle {
  white-space: normal !important;
  word-break: normal !important; /* Para garantir que palavras longas também quebrem */
}

/* Adaptações para garantir que o card seja centralizado e se ajuste bem */
.v-card {
  max-width: 90%;
  z-index: 10;
  position: relative;
}

@media (min-width: 600px) {
  .v-card {
    max-width: 600px;
  }
}
</style>