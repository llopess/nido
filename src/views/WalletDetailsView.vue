<template>
  <v-container fluid class="py-8 px-4 bg-background wallet-details-min-height">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn text @click="router.push({ name: 'wallets' })" color="primary">
          <v-icon left>mdi-arrow-left</v-icon>
          Voltar para Minhas Caixinhas
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="walletStore.activeWallet">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          Detalhes da Caixinha: {{ walletStore.activeWallet.nome }}
        </h1>
        <p
          class="text-h5 font-weight-bold"
          :class="{
            'text-success': walletStore.activeWallet.saldo >= 0,
            'text-error': walletStore.activeWallet.saldo < 0,
          }"
        >
          Saldo: {{ formatCurrency(walletStore.activeWallet.saldo) }}
        </p>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert type="info" prominent>Nenhuma caixinha selecionada ou encontrada.</v-alert>
      </v-col>
    </v-row>

    <v-row v-if="walletStore.activeWallet" class="mt-8 justify-center">
      <v-col cols="12" md="8">
        
        <v-card class="pa-6 elevation-2 rounded-lg h-full" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Membros da Caixinha</v-card-title
          >
          <v-card-text>
            <v-list class="bg-surface overflow-y-auto" style="max-height: 250px">
              
              <v-list-item v-for="memberId in walletStore.activeWallet.membros" :key="memberId">
                <template v-slot:prepend><v-icon>mdi-account-circle</v-icon></template>
                <v-list-item-title class="text-high-emphasis">
                  {{ getMemberName(memberId) }}
                  <span
                    v-if="memberId === walletStore.activeWallet.idUsuarioPrincipal"
                    class="text-medium-emphasis text-caption"
                    >(Principal)</span
                  >
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-btn color="primary" class="mt-4" @click="showInviteModal = true">
              <v-icon left>mdi-account-plus</v-icon> Convidar Novo Membro
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      
    </v-row>

    <v-row v-if="walletStore.activeWallet" class="mt-8">
      <v-col cols="12">
        <v-card class="pa-6 elevation-2 rounded-lg" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Todas as Transações</v-card-title
          >
          <v-card-text>
            <div class="overflow-x-auto">
              <v-data-table
                :headers="transactionHeaders"
                :items="transactionStore.transactions"
                :items-per-page="5"
                class="elevation-1"
                density="comfortable"
              >
                <template v-slot:item.valor="{ item }">
                  <span
                    :class="{
                      'text-success': item.tipo === 'ganho',
                      'text-error': item.tipo === 'despesa',
                    }"
                    class="font-weight-bold"
                  >
                    {{ item.tipo === 'ganho' ? '+' : '-' }} {{ formatCurrency(item.valor) }}
                  </span>
                </template>
                <template v-slot:item.dataTransacao="{ item }">
                  {{ formatDate(item.dataTransacao) }}
                </template>
                <template v-slot:item.usuario="{ item }">
                  {{ getMemberName(item.idUsuario) }}
                </template>
              </v-data-table>
            </div>
            <p
              v-if="!transactionStore.transactions.length"
              class="text-medium-emphasis text-center mt-4"
            >
              Nenhuma transação registrada para esta caixinha.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    
    <v-dialog v-model="showInviteModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white"
            >Convidar Membro para a Caixinha</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn icon @click="showInviteModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Envie este código de convite para quem você deseja adicionar a esta caixinha:
          </p>
          <v-text-field
            :value="walletStore.activeWallet ? walletStore.activeWallet.id : ''"
            label="Código de Convite da Caixinha"
            readonly
            outlined
            dense
            append-icon="mdi-content-copy"
            @click:append="copyInviteCode"
            class="font-weight-bold text-primary"
          ></v-text-field>
          <v-alert v-if="inviteMessage" :type="inviteMessageType" class="mt-4">{{
            inviteMessage
          }}</v-alert>
          <p class="text-medium-emphasis mt-4">
            (Em um sistema real, o usuário convidado usaria este código para se juntar à caixinha.)
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showInviteModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useWalletStore, useTransactionStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const transactionStore = useTransactionStore()

const showInviteModal = ref(false)
const inviteMessage = ref('')
const inviteMessageType = ref<'success' | 'error' | 'info'>('info')

const transactionMessage = ref('')
const transactionMessageType = ref<'success' | 'error' | 'info'>('info')

const newTransaction = ref({
  tipo: 'despesa',
  valor: 0,
  descricao: '',
  categoriaNome: '',
})

const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== '') || 'Campo obrigatório.',
  positive: (value: number) => value > 0 || 'O valor deve ser positivo.',
}

const transactionHeaders = [
  { title: 'Descrição', key: 'descricao' },
  { title: 'Categoria', key: 'categoriaNome' },
  { title: 'Valor', key: 'valor' },
  { title: 'Data', key: 'dataTransacao' },
  { title: 'Registrado por', key: 'usuario' },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const getMemberName = (userId: string) => {
  if (userId === authStore.currentUser?.id) {
    return `${authStore.currentUser.nome} (Você)`
  }
  return `Membro ID: ${userId.substring(0, 8)}...`
}

const showMessage = (elementRef: any, msg: string, isError: boolean) => {
  elementRef.value = msg
  if (elementRef === transactionMessage) {
    transactionMessageType.value = isError ? 'error' : 'success'
  } else if (elementRef === inviteMessage) {
    inviteMessageType.value = isError ? 'error' : 'success'
  }
}

const copyInviteCode = async () => {
  if (walletStore.activeWallet) {
    try {
      await navigator.clipboard.writeText(walletStore.activeWallet.id)
      showMessage(inviteMessage, 'Código copiado para a área de transferência!', false)
    } catch (err) {
      showMessage(inviteMessage, 'Falha ao copiar o código.', true)
    }
  }
}

watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === 'string') {
      walletStore.setActiveWallet(newId)
      await transactionStore.fetchTransactions(newId)
    } else {
      walletStore.activeWallet = null
      transactionStore.setTransactions([])
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'auth' })
  }
})
</script>

<style scoped>
.wallet-details-min-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
}
</style>
