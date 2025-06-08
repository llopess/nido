// src/stores/transaction.ts

import { defineStore } from 'pinia';
import { useAuthStore } from './auth'; // Para obter o ID do usuário
import { useWalletStore } from './wallet'; // Para atualizar o saldo da caixinha

interface Transaction {
  id: string;
  idCaixinha: string;
  idUsuario: string;
  valor: number;
  tipo: 'ganho' | 'despesa';
  descricao: string;
  categoriaNome: string;
  dataTransacao: string; // ISO string
}

interface TransactionState {
  transactions: Transaction[];
}

// SIMULAÇÃO DE BANCO DE DADOS EM MEMÓRIA (todas as transações de todas as caixinhas)
// ATUALIZADO: Datas ajustadas para Junho de 2025
const simulatedTransactions: Transaction[] = [
  { id: 't-001', idCaixinha: 'wallet-001', idUsuario: 'user_test_id', valor: 2500, tipo: 'ganho', descricao: 'Salário Mensal', categoriaNome: 'Renda', dataTransacao: '2025-06-01T10:00:00Z' },
  { id: 't-002', idCaixinha: 'wallet-001', idUsuario: 'user_test_id', valor: 500, tipo: 'despesa', descricao: 'Aluguel', categoriaNome: 'Moradia', dataTransacao: '2025-06-05T12:00:00Z' },
  { id: 't-003', idCaixinha: 'wallet-001', idUsuario: 'user_test_id', valor: 150, tipo: 'despesa', descricao: 'Supermercado', categoriaNome: 'Alimentação', dataTransacao: '2025-06-10T14:30:00Z' },
  { id: 't-004', idCaixinha: 'wallet-001', idUsuario: 'user_test_id', valor: 80, tipo: 'despesa', descricao: 'Transporte Público', categoriaNome: 'Transporte', dataTransacao: '2025-06-12T08:45:00Z' },
  { id: 't-005', idCaixinha: 'wallet-001', idUsuario: 'user_test_id', valor: 300, tipo: 'ganho', descricao: 'Freelance', categoriaNome: 'Renda Extra', dataTransacao: '2025-06-15T16:00:00Z' },
  { id: 't-006', idCaixinha: 'wallet-002', idUsuario: 'user_test_id', valor: 300, tipo: 'despesa', descricao: 'Passagem Aérea', categoriaNome: 'Viagem', dataTransacao: '2025-05-20T11:00:00Z' }, // Mantida no mês passado para teste de filtro
  { id: 't-007', idCaixinha: 'wallet-002', idUsuario: 'simulated-user-2', valor: 200, tipo: 'ganho', descricao: 'Economia para Viagem', categoriaNome: 'Viagem', dataTransacao: '2025-06-01T09:00:00Z' },
];


export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
  }),
  actions: {
    async fetchTransactions(walletId: string) {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          this.transactions = simulatedTransactions.filter(t => t.idCaixinha === walletId)
                                                .sort((a, b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime());
          resolve();
        }, 300);
      });
    },
    
    async addTransaction(transaction: Transaction, walletId: string) {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                simulatedTransactions.push(transaction); // Adiciona ao "BD" simulado
                
                // Recarrega as transações da caixinha ativa para refletir a mudança
                this.transactions = simulatedTransactions.filter(t => t.idCaixinha === walletId)
                                                        .sort((a, b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime());
                resolve();
            }, 500);
        });
    },

    $reset() {
      this.transactions = [];
    }
  },
  getters: {
    totalExpenses: (state) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      return state.transactions
        .filter(t => t.tipo === 'despesa' &&
                     new Date(t.dataTransacao).getMonth() === currentMonth &&
                     new Date(t.dataTransacao).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.valor, 0);
    },
    totalIncome: (state) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      return state.transactions
        .filter(t => t.tipo === 'ganho' &&
                     new Date(t.dataTransacao).getMonth() === currentMonth &&
                     new Date(t.dataTransacao).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.valor, 0);
    },
    recentTransactions: (state) => {
      return state.transactions.slice(0, 5); // Últimas 5 transações
    }
  }
});