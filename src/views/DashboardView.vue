<template>
  <v-container fluid class="py-8 px-4 bg-background dashboard-container-height">
    <div class="content-wrapper">
      <v-row class="mt-8 justify-center">
        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-4 elevation-2 rounded-lg card-top-fixed-height" color="surface">
            <v-row no-gutters class="align-center fill-height">
              <v-col cols="auto" class="pr-3">
                <v-icon size="48" color="primary">mdi-currency-usd</v-icon>
              </v-col>
              <v-col>
                <v-card-title class="text-h6 font-weight-bold text-primary justify-start pb-0 pl-0"
                  >Saldo Atual do Mês</v-card-title
                >
                <v-card-text
                  class="text-h5 font-weight-bold pl-0 pt-1"
                  :class="{
                    'text-success':
                      transactionStore.totalIncome - transactionStore.totalExpenses >= 0,
                    'text-error': transactionStore.totalIncome - transactionStore.totalExpenses < 0,
                    'text-medium-emphasis':
                      transactionStore.totalIncome - transactionStore.totalExpenses === 0,
                  }"
                >
                  {{
                    formatCurrency(transactionStore.totalIncome - transactionStore.totalExpenses)
                  }}
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="pa-4 elevation-2 rounded-lg card-top-fixed-height" color="surface">
            <v-row no-gutters class="align-center fill-height">
              <v-col cols="auto" class="pr-3">
                <v-icon size="48" color="primary">mdi-chart-line</v-icon>
              </v-col>
              <v-col>
                <v-card-title class="text-h6 font-weight-bold text-primary justify-start pb-0 pl-0"
                  >Resumo do Mês</v-card-title
                >
                <v-list density="compact" class="bg-surface pa-0 pt-1 compact-list">
                  <v-list-item class="px-0 py-0 min-h-0">
                    <template v-slot:prepend
                      ><v-icon size="small" color="success">mdi-arrow-up-bold</v-icon></template
                    >
                    <template v-slot:append
                      ><span class="text-success font-weight-bold text-caption">{{
                        formatCurrency(transactionStore.totalIncome)
                      }}</span></template
                    >
                  </v-list-item>
                  <v-list-item class="px-0 py-0 min-h-0">
                    <template v-slot:prepend
                      ><v-icon size="small" color="error">mdi-arrow-down-bold</v-icon></template
                    >
                    <template v-slot:append
                      ><span class="text-error font-weight-bold text-caption">{{
                        formatCurrency(transactionStore.totalExpenses)
                      }}</span></template
                    >
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6 justify-center">
        <v-col cols="12" md="8">
          <v-card
            class="pa-4 elevation-2 rounded-lg card-bottom-fixed-height d-flex flex-column"
            color="surface"
          >
            <v-card-title class="text-h6 font-weight-bold text-primary"
              >Transações Recentes</v-card-title
            >
            <v-card-text class="flex-grow-1 overflow-y-auto card-list-scroll-area">
              <v-list
                density="compact"
                v-if="transactionStore.recentTransactions.length"
                class="bg-surface"
              >
                <v-list-item v-for="t in transactionStore.recentTransactions" :key="t.id">
                  <template v-slot:prepend>
                    <v-icon :color="t.tipo === 'ganho' ? 'success' : 'error'">
                      {{ t.tipo === 'ganho' ? 'mdi-plus-circle' : 'mdi-minus-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title class="text-high-emphasis">{{
                    t.descricao
                  }}</v-list-item-title>
                  <v-list-item-subtitle class="text-medium-emphasis"
                    >{{ t.categoriaNome }} - {{ formatDate(t.dataTransacao) }}</v-list-item-subtitle
                  >
                  <template v-slot:append>
                    <span
                      :class="{
                        'text-success': t.tipo === 'ganho',
                        'text-error': t.tipo === 'despesa',
                      }"
                      class="font-weight-bold"
                    >
                      {{ t.tipo === 'ganho' ? '+' : '-' }} {{ formatCurrency(t.valor) }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="text-medium-emphasis text-center">Nenhuma transação recente.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore, useFundStore, useTransactionStore } from '@/stores'

const authStore = useAuthStore()
const fundStore = useFundStore()
const transactionStore = useTransactionStore()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

watch(
  () => fundStore.activeCarteiraId,
  async (newCarteiraId) => {
    if (newCarteiraId) {
      await transactionStore.fetchTransactions(newCarteiraId)
    } else {
      transactionStore.setTransactions([])
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await fundStore.fetchUserFunds()
    if (!fundStore.activeCarteiraId && fundStore.carteiras.length > 0) {
      fundStore.setActiveCarteira(fundStore.carteiras[0].id)
    }
  }
})
</script>

<style scoped>
.dashboard-container-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
  position: relative;
  overflow: hidden;
}

.card-top-fixed-height {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-bottom-fixed-height {
  height: 320px;

  max-height: calc(
    100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px) - 120px - 48px - 96px
  );
  display: flex;
  flex-direction: column;
}

.card-list-scroll-area {
  max-height: calc(100% - 60px);
  overflow-y: auto;
}

.v-list {
  padding-right: 8px;
}

.compact-list .v-list-item {
  min-height: unset !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

.compact-list .v-list-item__prepend,
.compact-list .v-list-item__append {
  align-self: center !important;
}

.compact-list .v-list-item-title,
.compact-list .v-list-item-subtitle {
  font-size: 0.75rem !important;
}
</style>
