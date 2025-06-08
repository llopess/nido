<template>
  <v-container fluid class="py-8 px-4 bg-background wallets-min-height">
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold text-primary mb-4">Minhas Caixinhas</h1>
        <p class="text-body-1 text-medium-emphasis">Gerencie e acesse suas caixinhas domésticas.</p>
      </v-col>
    </v-row>

    <v-row class="mt-8 justify-center">
      <v-col cols="12" md="6" lg="5">
        <v-card class="pa-6 elevation-2 rounded-lg h-full" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary">Suas Caixinhas</v-card-title>
          <v-card-text>
            <!-- Adicionado max-height e overflow-y-auto para rolagem interna -->
            <v-list
              v-if="walletStore.wallets.length"
              class="bg-surface overflow-y-auto"
              style="max-height: 400px"
            >
              <v-list-item
                v-for="wallet in walletStore.wallets"
                :key="wallet.id"
                @click="viewWalletDetails(wallet.id)"
              >
                <template v-slot:prepend>
                  <v-icon
                    :color="
                      wallet.id === walletStore.activeWalletId ? 'primary' : 'medium-emphasis'
                    "
                    >mdi-home-outline</v-icon
                  >
                </template>
                <v-list-item-title class="text-high-emphasis">{{ wallet.nome }}</v-list-item-title>
                <v-list-item-subtitle class="text-medium-emphasis"
                  >Saldo: {{ formatCurrency(wallet.saldo) }}</v-list-item-subtitle
                >
                <template v-slot:append>
                  <v-btn
                    icon
                    flat
                    size="small"
                    :color="
                      wallet.id === walletStore.activeWalletId ? 'primary' : 'medium-emphasis'
                    "
                    @click.stop="setActiveAndGoToDashboard(wallet.id)"
                  >
                    <v-icon>mdi-view-dashboard</v-icon>
                    <v-tooltip activator="parent" location="top">Ir para Dashboard</v-tooltip>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-medium-emphasis text-center">Nenhuma caixinha encontrada.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="5">
        <v-card class="pa-6 elevation-2 rounded-lg mb-6" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Criar Nova Caixinha</v-card-title
          >
          <v-card-text>
            <v-text-field
              v-model="newWalletName"
              label="Nome da Nova Caixinha"
              prepend-inner-icon="mdi-plus-box"
              :rules="[rules.required]"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="createWallet">Criar Caixinha</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="pa-6 elevation-2 rounded-lg" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Juntar-se a uma Caixinha</v-card-title
          >
          <v-card-text>
            <v-text-field
              v-model="joinWalletId"
              label="Código de Convite da Caixinha"
              prepend-inner-icon="mdi-link-variant"
              :rules="[rules.required]"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="joinWallet">Juntar-se</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useWalletStore, useTransactionStore } from '@/stores' // Transação não é estritamente necessária aqui, mas é bom ter

const authStore = useAuthStore()
const walletStore = useWalletStore()
// const transactionStore = useTransactionStore(); // Não necessário nesta view

const router = useRouter()

const newWalletName = ref('')
const joinWalletId = ref('')

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório.',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const createWallet = async () => {
  if (!newWalletName.value) return
  try {
    const userId = authStore.currentUser?.id || 'simulated-user' // Use ID real ou simulado
    const newWallet = {
      id: `wallet-${Date.now()}`, // ID simulado
      nome: newWalletName.value,
      saldo: 0,
      idUsuarioPrincipal: userId,
      membros: [userId], // Simula que o criador é membro
    }
    await walletStore.createWallet(newWallet)
    newWalletName.value = ''
    alert(`Caixinha "${newWallet.nome}" criada com sucesso!`)
    await walletStore.fetchWallets() // Recarregar lista
    viewWalletDetails(newWallet.id) // Redireciona para os detalhes da nova caixinha
  } catch (error) {
    alert(`Erro ao criar caixinha: ${error.message}`)
  }
}

const joinWallet = async () => {
  if (!joinWalletId.value) return
  try {
    const userId = authStore.currentUser?.id || 'simulated-user'
    await walletStore.joinWallet(joinWalletId.value, userId)
    joinWalletId.value = ''
    alert(`Juntou-se à caixinha com ID "${joinWalletId.value}" com sucesso!`)
    await walletStore.fetchWallets() // Recarregar lista
    viewWalletDetails(joinWalletId.value) // Redireciona para os detalhes da caixinha
  } catch (error) {
    alert(`Erro ao juntar-se à caixinha: ${error.message}`)
  }
}

const viewWalletDetails = (walletId: string) => {
  walletStore.setActiveWallet(walletId)
  router.push({ name: 'wallet-details', params: { id: walletId } })
}

const setActiveAndGoToDashboard = (walletId: string) => {
  walletStore.setActiveWallet(walletId)
  router.push({ name: 'dashboard' })
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await walletStore.fetchWallets()
  }
})
</script>

<style scoped>
.wallets-min-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
}
</style>
