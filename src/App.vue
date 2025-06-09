<template>
  <v-app>
    
    <v-app-bar app :color="theme.global.current.value.dark ? 'surface' : 'primary'" dark>
      
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-flex d-md-none"></v-app-bar-nav-icon>

      <v-toolbar-title class="text-h5 font-weight-bold">
        <router-link to="/" style="text-decoration: none">
          <img :src="logoSrc" alt="Logo do Nido" class="nido-logo" />
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      
      <v-btn icon @click="toggleTheme">
        <v-icon>{{
          theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-gibbous'
        }}</v-icon>
      </v-btn>

      
      <div class="d-none d-md-flex">
        <v-btn v-if="authStore.isLoggedIn" text to="/dashboard" class="text-white">Dashboard</v-btn>
        <v-btn v-if="authStore.isLoggedIn" text to="/funds" class="text-white">Meus Nidos</v-btn>
        

        
        <v-btn v-if="!authStore.isLoggedIn" text to="/auth" class="text-white"
          >Entrar/Registrar</v-btn
        >
        <v-btn v-else text @click="handleLogout" class="text-white">Sair</v-btn>
      </div>
    </v-app-bar>

    
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-divider></v-divider>

        <v-list-item v-if="authStore.isLoggedIn" link to="/dashboard" @click="drawer = false">
          <template v-slot:prepend><v-icon>mdi-view-dashboard</v-icon></template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="authStore.isLoggedIn" link to="/funds" @click="drawer = false">
          
          <template v-slot:prepend><v-icon>mdi-wallet-outline</v-icon></template>
          
          <v-list-item-title>Meus Nidos</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="!authStore.isLoggedIn" link to="/auth" @click="drawer = false">
          <template v-slot:prepend><v-icon>mdi-login</v-icon></template>
          <v-list-item-title>Entrar / Registrar</v-list-item-title>
        </v-list-item>

        <v-list-item v-else link @click="handleLogoutAndCloseDrawer">
          <template v-slot:prepend><v-icon>mdi-logout</v-icon></template>
          <v-list-item-title>Sair</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    
    <v-main>
      <router-view />
    </v-main>

    
    <v-menu
      v-if="
        authStore.isLoggedIn &&
        fundStore.activeCarteiraId &&
        $route.name !== 'auth' &&
        $route.name !== 'landing'
      "
    >
      <template v-slot:activator="{ props }">
        <v-btn
          class="fixed bottom-6 right-6 z-50 rounded-full elevation-10"
          color="primary"
          fab
          size="large"
          v-bind="props"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="showTransactionModal = true">
          <v-list-item-title>Registrar Ganho/Despesa</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openTransferModal">
          <v-list-item-title>Transferir Nidos</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    
    <v-dialog v-model="showTransactionModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white">Registrar Nova Transação</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showTransactionModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Registrar para:
            <span class="font-weight-bold text-primary">
              {{
                fundStore.activeCarteira ? fundStore.activeCarteira.nome : 'Nenhuma Carteira Ativa'
              }}
              <span v-if="fundStore.activeCaixinha"> -> {{ fundStore.activeCaixinha.nome }}</span>
            </span>
          </p>
          <v-form @submit.prevent="addGlobalTransaction">
            <v-select
              v-model="newGlobalTransaction.tipo"
              :items="['despesa', 'ganho']"
              label="Tipo"
              prepend-inner-icon="mdi-swap-horizontal"
              required
            ></v-select>
            <v-text-field
              v-model.number="newGlobalTransaction.valor"
              label="Valor (R$)"
              prepend-inner-icon="mdi-currency-usd"
              type="number"
              step="0.01"
              :rules="[rules.required, rules.positive]"
              required
            ></v-text-field>
            <v-text-field
              v-model="newGlobalTransaction.descricao"
              label="Descrição"
              prepend-inner-icon="mdi-note-text"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-text-field
              v-model="newGlobalTransaction.categoriaNome"
              label="Categoria"
              prepend-inner-icon="mdi-tag"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-btn type="submit" color="primary" block class="mt-4">Registrar Transação</v-btn>
            <v-alert
              v-if="globalTransactionMessage"
              :type="globalTransactionMessageType"
              class="mt-4"
              >{{ globalTransactionMessage }}</v-alert
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    
    <v-dialog v-model="showGlobalTransferModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white">Transferir Nidos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showGlobalTransferModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Transferir de:
            <span class="font-weight-bold text-primary">
              {{ fundStore.activeCarteira ? fundStore.activeCarteira.nome : 'N/A' }}
            </span>
          </p>
          <v-form @submit.prevent="handleGlobalTransfer">
            <v-select
              v-model="globalTransferSourceFundId"
              :items="availableTransferSourceFunds"
              label="Fundo de Origem"
              prepend-inner-icon="mdi-arrow-left-box"
              item-title="nome"
              item-value="id"
              :rules="[rules.required]"
              required
            ></v-select>
            <v-select
              v-model="globalTransferDestFundId"
              :items="availableGlobalTransferDestinations"
              label="Fundo de Destino"
              prepend-inner-icon="mdi-arrow-right-box"
              item-title="nome"
              item-value="id"
              :rules="[rules.required]"
              required
            ></v-select>
            <v-text-field
              v-model.number="globalTransferAmount"
              label="Valor da Transferência (R$)"
              prepend-inner-icon="mdi-currency-usd"
              type="number"
              step="0.01"
              :rules="[rules.required, rules.positive]"
              required
            ></v-text-field>
            <v-text-field
              v-model="globalTransferDescription"
              label="Descrição da Transferência"
              prepend-inner-icon="mdi-note-text"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-btn type="submit" color="primary" block class="mt-4">Realizar Transferência</v-btn>
            <v-alert v-if="globalTransferMessage" :type="globalTransferMessageType" class="mt-4">{{
              globalTransferMessage
            }}</v-alert>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    
    <v-footer
      app
      :color="theme.global.current.value.dark ? 'surface' : 'surface-light'"
      :class="{
        'text-text-medium-emphasis': !theme.global.current.value.dark,
        'text-gray-400': theme.global.current.value.dark,
      }"
    >
      <v-container class="text-center">
        &copy; {{ new Date().getFullYear() }} Nido App. Todos os direitos reservados.
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore, useFundStore, useTransactionStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import type { Carteira, Caixinha } from '@/types/funds'

const authStore = useAuthStore()
const fundStore = useFundStore()
const transactionStore = useTransactionStore()
const router = useRouter()
const route = useRoute()
const theme = useTheme()

const drawer = ref(false)

const showTransactionModal = ref(false)
const newGlobalTransaction = ref({
  tipo: 'despesa',
  valor: 0,
  descricao: '',
  categoriaNome: '',
})
const globalTransactionMessage = ref('')
const globalTransactionMessageType = ref<'success' | 'error' | 'info'>('info')

const showGlobalTransferModal = ref(false)
const globalTransferSourceFundId = ref(null)
const globalTransferDestFundId = ref(null)
const globalTransferAmount = ref(0)
const globalTransferDescription = ref('')
const globalTransferMessage = ref('')
const globalTransferMessageType = ref<'success' | 'error' | 'info'>('info')

const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== '') || 'Campo obrigatório.',
  positive: (value: number) => value > 0 || 'O valor deve ser positivo.',
}

const logoSrc = ref('bg.png')

authStore.initializeAuth()

const handleLogout = () => {
  authStore.logout()
  fundStore.$reset()
  transactionStore.$reset()
  router.push('/auth')
}

const handleLogoutAndCloseDrawer = () => {
  handleLogout()
  drawer.value = false
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'nidoThemeLight' : 'nidoThemeDark'
}

const addGlobalTransaction = async () => {
  let targetFundId: string | null = null
  let targetFundType: 'carteira' | 'caixinha' | null = null

  if (
    fundStore.activeCaixinhaId &&
    route.name === 'fund-details' &&
    route.params.type === 'caixinha'
  ) {
    targetFundId = fundStore.activeCaixinhaId
    targetFundType = 'caixinha'
  } else if (fundStore.activeCarteiraId) {
    targetFundId = fundStore.activeCarteiraId
    targetFundType = 'carteira'
  }

  if (!targetFundId || !targetFundType || !authStore.currentUser) {
    showGlobalMessage(
      'Nenhum fundo selecionado ou usuário não autenticado para registrar transações.',
      true,
    )
    return
  }

  const value = newGlobalTransaction.value.valor
  const description = newGlobalTransaction.value.descricao
  const categoryName = newGlobalTransaction.value.categoriaNome

  if (!value || isNaN(value) || value <= 0 || !description || !categoryName) {
    showGlobalMessage('Por favor, preencha todos os campos corretamente.', true)
    return
  }

  try {
    const transaction = {
      id: `trans-${Date.now()}`,
      idFundo: targetFundId,
      tipoFundo: targetFundType,
      idUsuario: authStore.currentUser.id,
      valor: value,
      tipo: newGlobalTransaction.value.tipo as 'ganho' | 'despesa',
      descricao: description,
      categoriaNome: categoryName,
      dataTransacao: new Date().toISOString(),
    }
    await transactionStore.addTransaction(transaction)

    showGlobalMessage('Transação registrada com sucesso!', false)
    newGlobalTransaction.value = { tipo: 'despesa', valor: 0, descricao: '', categoriaNome: '' }
    showTransactionModal.value = false

    if (route.name === 'dashboard' && fundStore.activeCarteiraId) {
      await fundStore.fetchUserFunds()
      await transactionStore.fetchTransactions(fundStore.activeCarteiraId)
    } else if (route.name === 'fund-details' && route.params.id && route.params.type) {
      await fundStore.fetchUserFunds()
      await transactionStore.fetchTransactions(route.params.id as string)
    }
  } catch (error: any) {
    showGlobalMessage(`Erro ao registrar transação: ${error.message}`, true)
  }
}

const showGlobalMessage = (msg: string, isError: boolean) => {
  globalTransactionMessage.value = msg
  globalTransactionMessageType.value = isError ? 'error' : 'success'
  setTimeout(() => {
    globalTransactionMessage.value = ''
  }, 5000)
}

const openTransferModal = () => {
  globalTransferSourceFundId.value = fundStore.activeCarteiraId
  globalTransferDestFundId.value = null
  globalTransferAmount.value = 0
  globalTransferDescription.value = ''
  globalTransferMessage.value = ''
  globalTransferMessageType.value = 'info'
  showGlobalTransferModal.value = true
}

const availableTransferSourceFunds = computed(() => {
  if (!authStore.currentUser) return []

  const userFunds = [
    ...fundStore.carteiras
      .filter((f) => f.membros.includes(authStore.currentUser!.id))
      .map((f) => ({ id: f.id, nome: f.nome, type: 'carteira' })),
    ...fundStore.caixinhas
      .filter((f) => f.membros.includes(authStore.currentUser!.id))
      .map((f) => ({ id: f.id, nome: f.nome, type: 'caixinha' })),
  ]
  return userFunds
})

const availableGlobalTransferDestinations = computed(() => {
  if (!globalTransferSourceFundId.value) return []
  const sourceFund = availableTransferSourceFunds.value.find(
    (f) => f.id === globalTransferSourceFundId.value,
  )
  if (!sourceFund) return []

  return availableTransferSourceFunds.value.filter((f) => f.id !== sourceFund.id)
})

const handleGlobalTransfer = async () => {
  if (
    !globalTransferSourceFundId.value ||
    !globalTransferDestFundId.value ||
    !authStore.currentUser
  ) {
    showGlobalMessage('Selecione os fundos de origem e destino.', true)
    return
  }
  if (globalTransferAmount.value <= 0 || isNaN(globalTransferAmount.value)) {
    showGlobalMessage('O valor da transferência deve ser positivo.', true)
    return
  }

  const sourceFund = availableTransferSourceFunds.value.find(
    (f) => f.id === globalTransferSourceFundId.value,
  )
  const destFund = availableGlobalTransferDestinations.value.find(
    (f) => f.id === globalTransferDestFundId.value,
  )

  if (!sourceFund || !destFund) {
    showGlobalMessage('Nidos de origem ou destino inválidos.', true)
    return
  }

  const currentSourceFundBalance =
    fundStore.getFundById(sourceFund.id, sourceFund.type as 'carteira' | 'caixinha')?.saldo || 0
  if (currentSourceFundBalance < globalTransferAmount.value) {
    showGlobalMessage('Saldo insuficiente no fundo de origem para esta transferência.', true)
    return
  }

  try {
    await transactionStore.transferFunds(
      sourceFund.id,
      sourceFund.type as 'carteira' | 'caixinha',
      destFund.id,
      destFund.type as 'carteira' | 'caixinha',
      globalTransferAmount.value,
      globalTransferDescription.value,
      authStore.currentUser.id,
    )

    showGlobalMessage('Transferência realizada com sucesso!', false)
    showGlobalTransferModal.value = false
    globalTransferSourceFundId.value = null
    globalTransferDestFundId.value = null
    globalTransferAmount.value = 0
    globalTransferDescription.value = ''

    await fundStore.fetchUserFunds()
    if (route.name === 'dashboard' && fundStore.activeCarteiraId) {
      await transactionStore.fetchTransactions(fundStore.activeCarteiraId)
    } else if (route.name === 'fund-details' && route.params.id && route.params.type) {
      await transactionStore.fetchTransactions(route.params.id as string)
    }
  } catch (error: any) {
    showGlobalMessage(`Erro na transferência: ${error.message}`, true)
  }
}
</script>

<style scoped>

.nido-logo {
  max-height: 90px; 
  width: auto; 
  filter: brightness(0) invert(1); 
}


.nido-logo-drawer {
  max-height: 32px;
  width: auto;
  margin-right: 8px; 
}


.text-white {
  text-decoration: none;
}
</style>
