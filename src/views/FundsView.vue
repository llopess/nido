<template>
  <v-container fluid class="py-8 px-4 bg-background funds-min-height">
    <v-tabs v-model="activeTab" color="primary" align-tabs="center" class="mt-4">
      <v-tab value="carteiras">Carteiras</v-tab>
      <v-tab value="caixinhas">Caixinhas</v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-8">
      <v-window-item value="carteiras">
        <v-row justify="center">
          <v-col cols="12" md="6" lg="5">
            <v-card class="pa-6 elevation-2 rounded-lg h-full" color="surface">
              <v-card-title class="text-h6 font-weight-bold text-primary"
                >Suas Carteiras</v-card-title
              >
              <v-card-text>
                <v-list
                  v-if="fundStore.carteiras.length"
                  class="bg-surface overflow-y-auto"
                  style="max-height: 250px"
                >
                  <v-list-item
                    v-for="carteira in fundStore.carteiras"
                    :key="carteira.id"
                    @click="viewFundDetails(carteira.id, 'carteira')"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :color="
                          carteira.id === fundStore.activeCarteiraId ? 'primary' : 'medium-emphasis'
                        "
                        >mdi-home-outline</v-icon
                      >
                    </template>
                    <v-list-item-title class="text-high-emphasis">{{
                      carteira.nome
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="text-medium-emphasis"
                      >Saldo: {{ formatCurrency(carteira.saldo) }}</v-list-item-subtitle
                    >
                    <template v-slot:append>
                      <v-btn
                        icon
                        flat
                        size="small"
                        :color="
                          carteira.id === fundStore.activeCarteiraId ? 'primary' : 'medium-emphasis'
                        "
                        @click.stop="setActiveAndGoToDashboard(carteira.id)"
                      >
                        <v-icon>mdi-view-dashboard</v-icon>
                        <v-tooltip activator="parent" location="top">Ir para Dashboard</v-tooltip>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                <p v-else class="text-medium-emphasis text-center">Nenhuma carteira encontrada.</p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="5">
            <v-card class="pa-6 elevation-2 rounded-lg mb-6" color="surface">
              <v-card-title class="text-h6 font-weight-bold text-primary"
                >Participar de uma Carteira</v-card-title
              >
              <v-card-text>
                <v-text-field
                  v-model="joinCarteiraId"
                  label="Código de participação da Carteira"
                  prepend-inner-icon="mdi-link-variant"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="joinCarteira">Participar</v-btn>
              </v-card-actions>
            </v-card>

            <v-card class="pa-6 elevation-2 rounded-lg" color="surface">
              <v-card-title class="text-h6 font-weight-bold text-primary"
                >Criar Nova Carteira</v-card-title
              >
              <v-card-text>
                <v-text-field
                  v-model="newCarteiraName"
                  label="Nome da Nova Carteira"
                  prepend-inner-icon="mdi-plus-box"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="createCarteira">Criar Carteira</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="caixinhas">
        <v-row justify="center">
          <v-col cols="12" md="6" lg="5">
            <v-card class="pa-6 elevation-2 rounded-lg h-full" color="surface">
              <v-card-title class="text-h6 font-weight-bold text-primary"
                >Suas Caixinhas</v-card-title
              >
              <v-card-text>
                <v-list
                  v-if="fundStore.caixinhas.length"
                  class="bg-surface overflow-y-auto"
                  style="max-height: 250px"
                >
                  <v-list-item
                    v-for="caixinha in fundStore.caixinhas"
                    :key="caixinha.id"
                    @click="viewFundDetails(caixinha.id, 'caixinha')"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :color="
                          caixinha.id === fundStore.activeCaixinhaId ? 'primary' : 'medium-emphasis'
                        "
                        >mdi-piggy-bank-outline</v-icon
                      >
                    </template>
                    <v-list-item-title class="text-high-emphasis">{{
                      caixinha.nome
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="text-medium-emphasis"
                      >Saldo: {{ formatCurrency(caixinha.saldo) }} ({{
                        caixinha.tipo
                      }})</v-list-item-subtitle
                    >
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
                  v-model="newCaixinhaName"
                  label="Nome da Nova Caixinha"
                  prepend-inner-icon="mdi-plus-box"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
                <v-select
                  v-model="newCaixinhaType"
                  :items="['viagem', 'reforma', 'geral', 'outros']"
                  label="Tipo da Caixinha"
                  prepend-inner-icon="mdi-shape-outline"
                  :rules="[rules.required]"
                  required
                ></v-select>
                <v-select
                  v-model="newCaixinhaAssociatedCarteira"
                  :items="fundStore.carteiras.map((c) => ({ title: c.nome, value: c.id }))"
                  label="Associar a uma Carteira (Opcional)"
                  prepend-inner-icon="mdi-home-outline"
                  clearable
                ></v-select>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="createCaixinha">Criar Caixinha</v-btn>
              </v-card-actions>
            </v-card>

            <v-card class="pa-6 elevation-2 rounded-lg" color="surface">
              <v-card-title class="text-h6 font-weight-bold text-primary"
                >Participar de uma Caixinha</v-card-title
              >
              <v-card-text>
                <v-text-field
                  v-model="joinCaixinhaId"
                  label="Código de participação da Caixinha"
                  prepend-inner-icon="mdi-link-variant"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="joinCaixinha">Participar</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useFundStore } from '@/stores'

const authStore = useAuthStore()
const fundStore = useFundStore()

const router = useRouter()

const activeTab = ref('carteiras')
const newCarteiraName = ref('')
const joinCarteiraId = ref('')
const newCaixinhaName = ref('')
const newCaixinhaType = ref('geral')
const newCaixinhaAssociatedCarteira = ref(null)
const joinCaixinhaId = ref('')

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório.',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const createCarteira = async () => {
  if (!newCarteiraName.value) return
  try {
    await fundStore.createCarteira(newCarteiraName.value)
    newCarteiraName.value = ''
    alert(`Carteira "${fundStore.activeCarteira?.nome}" criada com sucesso!`)
    await fundStore.fetchUserFunds()
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    alert(`Erro ao criar carteira: ${error.message}`)
  }
}

const joinCarteira = async () => {
  if (!joinCarteiraId.value) return
  try {
    const userId = authStore.currentUser?.id || 'simulated-user'
    await fundStore.joinFund(joinCarteiraId.value, userId, 'carteira')
    joinCarteiraId.value = ''
    alert(`Aderiu à carteira com ID "${joinCarteiraId.value}" com sucesso!`)
    await fundStore.fetchUserFunds()
    fundStore.setActiveCarteira(joinCarteiraId.value)
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    alert(`Erro ao aderir à carteira: ${error.message}`)
  }
}

const createCaixinha = async () => {
  if (!newCaixinhaName.value || !newCaixinhaType.value) return
  try {
    await fundStore.createCaixinha(
      newCaixinhaName.value,
      newCaixinhaType.value as any,
      newCaixinhaAssociatedCarteira.value || undefined,
    )
    newCaixinhaName.value = ''
    newCaixinhaType.value = 'geral'
    newCaixinhaAssociatedCarteira.value = null
    alert(`Caixinha "${newCaixinhaName.value}" criada com sucesso!`)
    await fundStore.fetchUserFunds()
  } catch (error: any) {
    alert(`Erro ao criar caixinha: ${error.message}`)
  }
}

const joinCaixinha = async () => {
  if (!joinCaixinhaId.value) return
  try {
    const userId = authStore.currentUser?.id || 'simulated-user'
    await fundStore.joinFund(joinCaixinhaId.value, userId, 'caixinha')
    joinCaixinhaId.value = ''
    alert(`Aderiu à caixinha com ID "${joinCaixinhaId.value}" com sucesso!`)
    await fundStore.fetchUserFunds()
  } catch (error: any) {
    alert(`Erro ao aderir à caixinha: ${error.message}`)
  }
}

const viewFundDetails = (id: string, type: 'carteira' | 'caixinha') => {
  if (type === 'carteira') {
    fundStore.setActiveCarteira(id)
    fundStore.setActiveCaixinha(null)
  } else {
    fundStore.setActiveCaixinha(id)

    const caixinha = fundStore.caixinhas.find((c) => c.id === id)
    if (caixinha && caixinha.idCarteiraAssociada) {
      fundStore.setActiveCarteira(caixinha.idCarteiraAssociada)
    }
  }
  router.push({ name: 'fund-details', params: { type: type, id: id } })
}

const setActiveAndGoToDashboard = (carteiraId: string) => {
  fundStore.setActiveCarteira(carteiraId)
  router.push({ name: 'dashboard' })
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await fundStore.fetchUserFunds()
  }
})
</script>

<style scoped>
.funds-min-height {
  min-height: calc(100vh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px));
}
</style>
