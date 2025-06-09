<template>
  <v-container fluid class="fill-height pa-4 pa-sm-6 pa-md-8">
    <v-row class="d-flex justify-center align-center flex-grow-1 min-h-[60vh] md:min-h-[70vh]">
      <v-col cols="12" class="text-center">
        <h1
          class="text-h3 sm:text-h2 md:text-h1 font-weight-bold text-primary mb-4 animate-fade-in"
        >
          Bem-vindo(a) ao Nido!
        </h1>
        <p class="text-h6 sm:text-h5 text-medium-emphasis mb-8 animate-fade-in delay-100">
          Seu lar, suas finanças, tudo em um só lugar.
        </p>
        <v-btn
          color="primary"
          class="mt-4 animate-fade-in delay-200"
          size="large"
          @click="goToWallets"
        >
          <v-icon left>mdi-wallet</v-icon>
          Começar a Gerenciar Caixinhas
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-12">
      <v-col cols="12" md="6" class="animate-slide-up">
        <v-card class="pa-4 pa-sm-6 elevation-2 rounded-lg h-full d-flex flex-column">
          <v-card-title class="text-h6 sm:text-h5 text-primary pb-3">Sobre o Nido</v-card-title>
          <v-card-text class="text-medium-emphasis flex-grow-1">
            O Nido é um sistema intuitivo para controle de gastos domésticos, ideal para famílias ou
            grupos que dividem despesas. Simplifique a gestão financeira da sua casa e colabore com
            outros moradores para manter tudo em ordem. Nosso objetivo é proporcionar clareza e
            controle, transformando a complexidade das finanças compartilhadas em uma experiência
            simples e transparente.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="animate-slide-up delay-100">
        <v-card class="pa-4 pa-sm-6 elevation-2 rounded-lg h-full d-flex flex-column">
          <v-card-title class="text-h6 sm:text-h5 text-primary pb-3"
            >Recursos Principais</v-card-title
          >
          <v-card-text class="flex-grow-1">
            <v-list dense class="bg-surface">
              <v-list-item>
                <template v-slot:prepend
                  ><v-icon color="success">mdi-check-circle</v-icon></template
                >
                <v-list-item-title class="text-medium-emphasis"
                  >Crie caixinhas para cada residência.</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend
                  ><v-icon color="success">mdi-check-circle</v-icon></template
                >
                <v-list-item-title class="text-medium-emphasis"
                  >Convide outros usuários para suas caixinhas.</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend
                  ><v-icon color="success">mdi-check-circle</v-icon></template
                >
                <v-list-item-title class="text-medium-emphasis"
                  >Registre despesas e ganhos facilmente.</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend
                  ><v-icon color="success">mdi-check-circle</v-icon></template
                >
                <v-list-item-title class="text-medium-emphasis"
                  >Visualize dashboards de gastos e saldos.</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToWallets = () => {
  alert('Funcionalidade "Gerenciar Caixinhas" será implementada nas próximas etapas!')
}
</script>

<style scoped>

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-fade-in.delay-100 {
  animation-delay: 0.1s;
}

.animate-fade-in.delay-200 {
  animation-delay: 0.2s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
}

.animate-slide-up.delay-100 {
  animation-delay: 0.1s;
}
</style>
