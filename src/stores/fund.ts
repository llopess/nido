import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Caixinha, Carteira, Fund } from '@/types/funds'

interface FundState {
  carteiras: Carteira[]
  caixinhas: Caixinha[]
  activeCarteiraId: string | null
  activeCarteira: Carteira | null
  activeCaixinhaId: string | null
  activeCaixinha: Caixinha | null
  allUsers: { id: string; nome: string }[]
}

const simulatedCarteiras: Carteira[] = [
  {
    id: 'carteira-casa-001',
    nome: 'Orçamento da Casa',
    saldo: 1500.0,
    idUsuarioPrincipal: 'user_test_id',
    membros: ['user_test_id', 'simulated-user-2'],
    tipo: 'casa',
  },
]

const simulatedCaixinhas: Caixinha[] = [
  {
    id: 'caixinha-viagem-001',
    nome: 'Fundo Viagem',
    saldo: 750.0,
    idUsuarioPrincipal: 'user_test_id',
    idCarteiraAssociada: 'carteira-casa-001',
    membros: ['user_test_id', 'simulated-user-3'],
    tipo: 'viagem',
  },
  {
    id: 'caixinha-reforma-001',
    nome: 'Reforma Cozinha',
    saldo: 200.0,
    idUsuarioPrincipal: 'user_test_id',
    membros: ['user_test_id'],
    tipo: 'reforma',
  },
]

const simulatedUsers = [
  { id: 'user_test_id', nome: 'Usuário Teste' },
  { id: 'simulated-user-2', nome: 'Maria Colaboradora' },
  { id: 'simulated-user-3', nome: 'João Viajante' },
]

export const useFundStore = defineStore('fund', {
  state: (): FundState => ({
    carteiras: [],
    caixinhas: [],
    activeCarteiraId: null,
    activeCarteira: null,
    activeCaixinhaId: null,
    activeCaixinha: null,
    allUsers: simulatedUsers,
  }),
  actions: {
    async fetchUserFunds() {
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        this.carteiras = []
        this.caixinhas = []
        return
      }
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const currentUserId = authStore.currentUser!.id

          this.carteiras = simulatedCarteiras.filter((c) => c.membros.includes(currentUserId))

          this.caixinhas = simulatedCaixinhas.filter((c) => c.membros.includes(currentUserId))

          if (this.carteiras.length > 0 && !this.activeCarteiraId) {
            this.setActiveCarteira(this.carteiras[0].id)
          }
          resolve()
        }, 300)
      })
    },

    async createCarteira(nome: string) {
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        throw new Error('Usuário não autenticado para criar carteira.')
      }
      return new Promise<Carteira>((resolve) => {
        setTimeout(() => {
          const newCarteira: Carteira = {
            id: `carteira-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            nome: nome,
            saldo: 0,
            idUsuarioPrincipal: authStore.currentUser!.id,
            membros: [authStore.currentUser!.id],
            tipo: 'casa',
          }
          simulatedCarteiras.push(newCarteira)
          this.carteiras.push(newCarteira)
          this.setActiveCarteira(newCarteira.id)
          resolve(newCarteira)
        }, 500)
      })
    },

    async createCaixinha(nome: string, tipo: Caixinha['tipo'], idCarteiraAssociada?: string) {
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        throw new Error('Usuário não autenticado para criar caixinha.')
      }
      return new Promise<Caixinha>((resolve) => {
        setTimeout(() => {
          const newCaixinha: Caixinha = {
            id: `caixinha-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            nome: nome,
            saldo: 0,
            idUsuarioPrincipal: authStore.currentUser!.id,
            idCarteiraAssociada: idCarteiraAssociada,
            membros: [authStore.currentUser!.id],
            tipo: tipo,
          }
          simulatedCaixinhas.push(newCaixinha)
          this.caixinhas.push(newCaixinha)

          resolve(newCaixinha)
        }, 500)
      })
    },

    async joinFund(fundId: string, userId: string, fundType: 'carteira' | 'caixinha') {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          let fundToJoin: Fund | undefined
          if (fundType === 'carteira') {
            fundToJoin = simulatedCarteiras.find((f) => f.id === fundId)
          } else {
            fundToJoin = simulatedCaixinhas.find((f) => f.id === fundId)
          }

          if (!fundToJoin) {
            return reject(new Error('Fundo não encontrado.'))
          }
          if (fundToJoin.membros.includes(userId)) {
            return reject(new Error('Você já é membro deste fundo.'))
          }

          fundToJoin.membros.push(userId)

          if (fundType === 'carteira') {
            const localFund = this.carteiras.find((f) => f.id === fundId)
            if (localFund) {
              localFund.membros.push(userId)
            }
          } else {
            const localFund = this.caixinhas.find((f) => f.id === fundId)
            if (localFund) {
              localFund.membros.push(userId)
            }
          }
          resolve()
        }, 500)
      })
    },

    setActiveCarteira(carteiraId: string) {
      this.activeCarteiraId = carteiraId
      this.activeCarteira = this.carteiras.find((c) => c.id === carteiraId) || null

      this.activeCaixinhaId = null
      this.activeCaixinha = null
    },

    setActiveCaixinha(caixinhaId: string) {
      this.activeCaixinhaId = caixinhaId
      this.activeCaixinha = this.caixinhas.find((c) => c.id === caixinhaId) || null
    },

    updateFundBalance(fundId: string, fundType: 'carteira' | 'caixinha', newBalance: number) {
      if (fundType === 'carteira') {
        const carteira = this.carteiras.find((c) => c.id === fundId)
        const simulatedCarteira = simulatedCarteiras.find((c) => c.id === fundId)
        if (carteira && simulatedCarteira) {
          carteira.saldo = newBalance
          simulatedCarteira.saldo = newBalance
          if (this.activeCarteiraId === fundId) {
            this.activeCarteira!.saldo = newBalance
          }
        }
      } else {
        const caixinha = this.caixinhas.find((c) => c.id === fundId)
        const simulatedCaixinha = simulatedCaixinhas.find((c) => c.id === fundId)
        if (caixinha && simulatedCaixinha) {
          caixinha.saldo = newBalance
          simulatedCaixinha.saldo = newBalance
          if (this.activeCaixinhaId === fundId) {
            this.activeCaixinha!.saldo = newBalance
          }
        }
      }
    },

    $reset() {
      this.carteiras = []
      this.caixinhas = []
      this.activeCarteiraId = null
      this.activeCarteira = null
      this.activeCaixinhaId = null
      this.activeCaixinha = null
    },
  },
  getters: {
    getFundById: (state) => (id: string, type: 'carteira' | 'caixinha') => {
      if (type === 'carteira') {
        return state.carteiras.find((c) => c.id === id)
      } else {
        return state.caixinhas.find((c) => c.id === id)
      }
    },
    getUserNameById: (state) => (userId: string) => {
      const user = state.allUsers.find((u) => u.id === userId)
      return user ? user.nome : `ID Desconhecido (${userId.substring(0, 6)}...)`
    },
    getCaixinhasForActiveCarteira: (state) => {
      if (!state.activeCarteiraId) return []
      return state.caixinhas.filter((c) => c.idCarteiraAssociada === state.activeCarteiraId)
    },
  },
})
