<template>
  <v-container fluid class="py-8 px-4 bg-background fund-details-min-height">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn text @click="router.push({ name: 'funds' })" color="primary">
          <v-icon left>mdi-arrow-left</v-icon>
          Voltar para Meus Nidos
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="activeFund">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          Detalhes d{{ activeFund.tipo === 'casa' ? 'a Carteira' : 'a Caixinha' }}:
          {{ activeFund.nome }}
        </h1>
        <p
          class="text-h5 font-weight-bold"
          :class="{ 'text-success': activeFund.saldo >= 0, 'text-error': activeFund.saldo < 0 }"
        >
          Saldo: {{ formatCurrency(activeFund.saldo) }}
        </p>
        <p v-if="activeFund.tipo !== 'casa'" class="text-body-1 text-medium-emphasis">
          Tipo: {{ activeFund.tipo.charAt(0).toUpperCase() + activeFund.tipo.slice(1) }}
          <span v-if="activeFund.idCarteiraAssociada">
            (Associada a:
            {{ fundStore.getFundById(activeFund.idCarteiraAssociada, 'carteira')?.nome || 'N/A' }})
          </span>
        </p>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert type="info" prominent>Fundo não selecionado ou encontrado.</v-alert>
      </v-col>
    </v-row>

    <v-row v-if="activeFund" class="mt-8 justify-center">
      <v-col cols="12" md="8">
        <v-card class="pa-6 elevation-2 rounded-lg h-full" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Membros d{{ activeFund.tipo === 'casa' ? 'a Carteira' : 'a Caixinha' }}</v-card-title
          >
          <v-card-text>
            <v-list class="bg-surface overflow-y-auto" style="max-height: 250px">
              <v-list-item v-for="memberId in activeFund.membros" :key="memberId">
                <template v-slot:prepend><v-icon>mdi-account-circle</v-icon></template>
                <v-list-item-title class="text-high-emphasis">
                  {{ getMemberName(memberId) }}
                  <span
                    v-if="memberId === activeFund.idUsuarioPrincipal"
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

    <v-row v-if="activeFund" class="mt-8">
      <v-col cols="12">
        <v-card class="pa-6 elevation-2 rounded-lg" color="surface">
          <v-card-title class="text-h6 font-weight-bold text-primary"
            >Transações d{{
              activeFund.tipo === 'casa' ? 'a Carteira' : 'a Caixinha'
            }}</v-card-title
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
                      'text-info': item.tipo === 'transferencia',
                    }"
                    class="font-weight-bold"
                  >
                    {{ item.tipo === 'ganho' ? '+' : item.tipo === 'despesa' ? '-' : '' }}
                    {{ formatCurrency(item.valor) }}
                  </span>
                </template>
                <template v-slot:item.dataTransacao="{ item }">
                  {{ formatDate(item.dataTransacao) }}
                </template>
                <template v-slot:item.usuario="{ item }">
                  {{ getMemberName(item.idUsuario) }}
                </template>
                <template v-slot:item.tipo="{ item }">
                  {{ item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) }}
                  <span v-if="item.tipo === 'transferencia' && item.idFundoDestino">
                    para {{ fundStore.getFundById(item.idFundoDestino, 'caixinha')?.nome || 'N/A' }}
                  </span>
                </template>
              </v-data-table>
            </div>
            <p
              v-if="!transactionStore.transactions.length"
              class="text-medium-emphasis text-center mt-4"
            >
              Nenhuma transação registrada para este fundo.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showInviteModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white">Convidar Membro para o Fundo</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showInviteModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Envie este código de convite para quem você deseja adicionar a este fundo:
          </p>
          <v-text-field
            :value="activeFund ? activeFund.id : ''"
            label="Código de Convite do Fundo"
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
            (Em um sistema real, o usuário convidado usaria este código para se juntar ao fundo.)
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showInviteModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showTransferModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white">Transferir Nidos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showTransferModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Transferir de:
            <span class="font-weight-bold text-primary">{{
              activeFund ? activeFund.nome : 'N/A'
            }}</span>
          </p>
          <v-form @submit.prevent="handleTransfer">
            <v-select
              v-model="transferDestFundId"
              :items="availableTransferDestinations"
              label="Transferir para (Fundo de Destino)"
              prepend-inner-icon="mdi-arrow-right-box"
              item-title="nome"
              item-value="id"
              :rules="[rules.required]"
              required
            ></v-select>
            <v-text-field
              v-model.number="transferAmount"
              label="Valor da Transferência (R$)"
              prepend-inner-icon="mdi-currency-usd"
              type="number"
              step="0.01"
              :rules="[rules.required, rules.positive]"
              required
            ></v-text-field>
            <v-text-field
              v-model="transferDescription"
              label="Descrição da Transferência"
              prepend-inner-icon="mdi-note-text"
              :rules="[rules.required]"
              required
            ></v-text-field>
            <v-btn type="submit" color="primary" block class="mt-4">Realizar Transferência</v-btn>
            <v-alert v-if="transferMessage" :type="transferMessageType" class="mt-4">{{
              transferMessage
            }}</v-alert>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useFundStore, useTransactionStore } from '@/stores'
import type { Caixinha, Carteira, Fund } from '@/stores'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const fundStore = useFundStore()
const transactionStore = useTransactionStore()

const showInviteModal = ref(false)
const inviteMessage = ref('')
const inviteMessageType = ref<'success' | 'error' | 'info'>('info')

const showTransferModal = ref(false)
const transferDestFundId = ref(null)
const transferAmount = ref(0)
const transferDescription = ref('')
const transferMessage = ref('')
const transferMessageType = ref<'success' | 'error' | 'info'>('info')

const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== '') || 'Campo obrigatório.',
  positive: (value: number) => value > 0 || 'O valor deve ser positivo.',
}

const activeFund = computed<Fund | null>(() => {
  if (route.params.type === 'carteira' && fundStore.activeCarteiraId === route.params.id) {
    return fundStore.activeCarteira
  } else if (route.params.type === 'caixinha' && fundStore.activeCaixinhaId === route.params.id) {
    return fundStore.activeCaixinha
  }
  return null
})

const transactionHeaders = [
  { title: 'Tipo', key: 'tipo' },
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
  return fundStore.getUserNameById(userId)
}

const showMessage = (elementRef: any, msg: string, isError: boolean) => {
  elementRef.value = msg
  if (elementRef === inviteMessage) {
    inviteMessageType.value = isError ? 'error' : 'success'
  } else if (elementRef === transferMessage) {
    transferMessageType.value = isError ? 'error' : 'success'
  }

  setTimeout(() => {
    elementRef.value = ''
  }, 5000)
}

const copyInviteCode = async () => {
  if (activeFund.value) {
    try {
      await navigator.clipboard.writeText(activeFund.value.id)
      showMessage(inviteMessage, 'Código copiado para a área de transferência!', false)
    } catch (err) {
      showMessage(inviteMessage, 'Falha ao copiar o código.', true)
    }
  }
}

const availableTransferDestinations = computed(() => {
  if (!activeFund.value) return []

  if (activeFund.value.tipo === 'casa') {
    return fundStore.caixinhas
      .filter((c) => c.membros.includes(authStore.currentUser!.id) && c.id !== activeFund.value!.id)
      .map((c) => ({ id: c.id, nome: c.nome, type: 'caixinha' }))
  } else {
    const carteiraAssociada = fundStore.getFundById(
      (activeFund.value as Caixinha).idCarteiraAssociada!,
      'carteira',
    )
    if (carteiraAssociada && carteiraAssociada.membros.includes(authStore.currentUser!.id)) {
      return [{ id: carteiraAssociada.id, nome: carteiraAssociada.nome, type: 'carteira' }]
    }
    return []
  }
})

const handleTransfer = async () => {
  if (!activeFund.value || !transferDestFundId.value || !authStore.currentUser) {
    showMessage(transferMessage, 'Fundo de origem/destino ou usuário inválido.', true)
    return
  }
  if (transferAmount.value <= 0 || isNaN(transferAmount.value)) {
    showMessage(transferMessage, 'O valor da transferência deve ser positivo.', true)
    return
  }
  if (activeFund.value.saldo < transferAmount.value) {
    showMessage(transferMessage, 'Saldo insuficiente no fundo de origem.', true)
    return
  }

  try {
    const destFundInfo = availableTransferDestinations.value.find(
      (d) => d.id === transferDestFundId.value,
    )
    if (!destFundInfo) {
      showMessage(transferMessage, 'Fundo de destino inválido.', true)
      return
    }

    await transactionStore.transferFunds(
      activeFund.value.id,
      activeFund.value.tipo === 'casa' ? 'carteira' : 'caixinha',
      destFundInfo.id,
      destFundInfo.type as 'carteira' | 'caixinha',
      transferAmount.value,
      transferDescription.value,
      authStore.currentUser.id,
    )

    showMessage(transferMessage, 'Transferência realizada com sucesso!', false)
    showTransferModal.value = false
    transferAmount.value = 0
    transferDescription.value = ''
    transferDestFundId.value = null

    await fundStore.fetchUserFunds()
    await transactionStore.fetchTransactions(activeFund.value.id)
  } catch (error: any) {
    showMessage(transferMessage, `Erro na transferência: ${error.message}`, true)
  }
}

watch(
  () => [route.params.id, route.params.type],
  async ([newId, newType]) => {
    if (newId && typeof newId === 'string' && newType && typeof newType === 'string') {
      if (newType === 'carteira') {
        fundStore.setActiveCarteira(newId)
      } else if (newType === 'caixinha') {
        fundStore.setActiveCaixinha(newId)

        const caixinha = fundStore.caixinhas.find((c) => c.id === newId)
        if (caixinha && caixinha.idCarteiraAssociada) {
          fundStore.setActiveCarteira(caixinha.idCarteiraAssociada)
        }
      }
      await transactionStore.fetchTransactions(newId)
    } else {
      fundStore.activeCarteira = null
      fundStore.activeCaixinha = null
      transactionStore.setTransactions([])
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'auth' })
  } else {
    await fundStore.fetchUserFunds()
  }
})
</script>

<style scoped>
.fund-details-min-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
}
</style>
