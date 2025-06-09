import { defineStore } from 'pinia'
import { useFundStore } from './fund'
import type { Transaction } from '@/types/funds'

interface TransactionState {
  transactions: Transaction[]
}

const simulatedAllTransactions: Transaction[] = [
  {
    id: 't-001',
    idFundo: 'carteira-casa-001',
    tipoFundo: 'carteira',
    idUsuario: 'user_test_id',
    valor: 2500,
    tipo: 'ganho',
    descricao: 'Salário Mensal',
    categoriaNome: 'Renda',
    dataTransacao: '2025-06-01T10:00:00Z',
  },
  {
    id: 't-002',
    idFundo: 'carteira-casa-001',
    tipoFundo: 'carteira',
    idUsuario: 'user_test_id',
    valor: 500,
    tipo: 'despesa',
    descricao: 'Aluguel',
    categoriaNome: 'Moradia',
    dataTransacao: '2025-06-05T12:00:00Z',
  },
  {
    id: 't-003',
    idFundo: 'carteira-casa-001',
    tipoFundo: 'carteira',
    idUsuario: 'user_test_id',
    valor: 150,
    tipo: 'despesa',
    descricao: 'Supermercado',
    categoriaNome: 'Alimentação',
    dataTransacao: '2025-06-10T14:30:00Z',
  },

  {
    id: 't-004',
    idFundo: 'carteira-casa-001',
    tipoFundo: 'carteira',
    idUsuario: 'user_test_id',
    valor: 200,
    tipo: 'transferencia',
    descricao: 'Transferência para Fundo Viagem',
    categoriaNome: 'Transferência Saída',
    dataTransacao: '2025-06-12T08:45:00Z',
    idFundoDestino: 'caixinha-viagem-001',
  },
  {
    id: 't-005',
    idFundo: 'carteira-casa-001',
    tipoFundo: 'carteira',
    idUsuario: 'user_test_id',
    valor: 300,
    tipo: 'ganho',
    descricao: 'Freelance',
    categoriaNome: 'Renda Extra',
    dataTransacao: '2025-06-15T16:00:00Z',
  },

  {
    id: 't-006',
    idFundo: 'caixinha-viagem-001',
    tipoFundo: 'caixinha',
    idUsuario: 'user_test_id',
    valor: 200,
    tipo: 'ganho',
    descricao: 'Recebido de Orçamento da Casa',
    categoriaNome: 'Transferência Entrada',
    dataTransacao: '2025-06-12T08:45:00Z',
  },
  {
    id: 't-007',
    idFundo: 'caixinha-viagem-001',
    tipoFundo: 'caixinha',
    idUsuario: 'simulated-user-3',
    valor: 100,
    tipo: 'ganho',
    descricao: 'Contribuição João',
    categoriaNome: 'Contribuição',
    dataTransacao: '2025-06-14T10:00:00Z',
  },
  {
    id: 't-008',
    idFundo: 'caixinha-viagem-001',
    tipoFundo: 'caixinha',
    idUsuario: 'user_test_id',
    valor: 50,
    tipo: 'despesa',
    descricao: 'Reserva Hotel',
    categoriaNome: 'Hospedagem',
    dataTransacao: '2025-06-16T15:00:00Z',
  },

  {
    id: 't-009',
    idFundo: 'caixinha-reforma-001',
    tipoFundo: 'caixinha',
    idUsuario: 'user_test_id',
    valor: 200,
    tipo: 'ganho',
    descricao: 'Investimento inicial',
    categoriaNome: 'Capital',
    dataTransacao: '2025-05-01T09:00:00Z',
  },
]

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
  }),
  actions: {
    async fetchTransactions(fundId: string) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.transactions = simulatedAllTransactions
            .filter((t) => t.idFundo === fundId)
            .sort(
              (a, b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime(),
            )
          resolve()
        }, 300)
      })
    },

    async addTransaction(transaction: Transaction) {
      const fundStore = useFundStore()
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          simulatedAllTransactions.push(transaction)

          this.transactions = simulatedAllTransactions
            .filter((t) => t.idFundo === transaction.idFundo)
            .sort(
              (a, b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime(),
            )

          let currentFund = fundStore.getFundById(transaction.idFundo, transaction.tipoFundo)
          if (currentFund) {
            let newBalance = currentFund.saldo
            if (transaction.tipo === 'ganho') {
              newBalance += transaction.valor
            } else if (transaction.tipo === 'despesa') {
              newBalance -= transaction.valor
            }

            fundStore.updateFundBalance(currentFund.id, transaction.tipoFundo, newBalance)
          }
          resolve()
        }, 500)
      })
    },

    async transferFunds(
      idFundoOrigem: string,
      tipoFundoOrigem: 'carteira' | 'caixinha',
      idFundoDestino: string,
      tipoFundoDestino: 'carteira' | 'caixinha',
      valor: number,
      descricao: string,
      idUsuario: string,
    ) {
      const fundStore = useFundStore()
      return new Promise<void>(async (resolve, reject) => {
        setTimeout(async () => {
          const origem = fundStore.getFundById(idFundoOrigem, tipoFundoOrigem)
          const destino = fundStore.getFundById(idFundoDestino, tipoFundoDestino)

          if (!origem || !destino) {
            return reject(new Error('Fundo de origem ou destino não encontrado.'))
          }
          if (origem.saldo < valor) {
            return reject(new Error('Saldo insuficiente no fundo de origem.'))
          }

          const transactionOut: Transaction = {
            id: `trans-${Date.now()}-out`,
            idFundo: idFundoOrigem,
            tipoFundo: tipoFundoOrigem,
            idUsuario: idUsuario,
            valor: valor,
            tipo: 'transferencia',
            descricao: `Transferência para ${destino.nome}: ${descricao}`,
            categoriaNome: 'Transferência Saída',
            dataTransacao: new Date().toISOString(),
            idFundoDestino: idFundoDestino,
          }
          const transactionIn: Transaction = {
            id: `trans-${Date.now()}-in`,
            idFundo: idFundoDestino,
            tipoFundo: tipoFundoDestino,
            idUsuario: idUsuario,
            valor: valor,
            tipo: 'ganho',
            descricao: `Recebido de ${origem.nome}: ${descricao}`,
            categoriaNome: 'Transferência Entrada',
            dataTransacao: new Date().toISOString(),
          }

          simulatedAllTransactions.push(transactionOut)
          simulatedAllTransactions.push(transactionIn)

          fundStore.updateFundBalance(origem.id, tipoFundoOrigem, origem.saldo - valor)
          fundStore.updateFundBalance(destino.id, tipoFundoDestino, destino.saldo + valor)

          resolve()
        }, 500)
      })
    },

    setTransactions(transactions: Transaction[]) {
      this.transactions = transactions
    },

    $reset() {
      this.transactions = []
    },
  },
  getters: {
    totalExpenses: (state) => {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      return state.transactions
        .filter(
          (t) =>
            t.tipo === 'despesa' &&
            new Date(t.dataTransacao).getMonth() === currentMonth &&
            new Date(t.dataTransacao).getFullYear() === currentYear,
        )
        .reduce((sum, t) => sum + t.valor, 0)
    },
    totalIncome: (state) => {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      return state.transactions
        .filter(
          (t) =>
            t.tipo === 'ganho' &&
            new Date(t.dataTransacao).getMonth() === currentMonth &&
            new Date(t.dataTransacao).getFullYear() === currentYear,
        )
        .reduce((sum, t) => sum + t.valor, 0)
    },
    recentTransactions: (state) => {
      return state.transactions.slice(0, 5)
    },
  },
})
