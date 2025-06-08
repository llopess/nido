import { defineStore } from 'pinia';
import { useAuthStore } from './auth'; // Importar auth store para acesso ao ID do usuário

interface Wallet {
  id: string;
  nome: string;
  saldo: number;
  idUsuarioPrincipal: string;
  membros: string[]; // Lista de IDs de usuários
}

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  activeWallet: Wallet | null;
}

// SIMULAÇÃO DE BANCO DE DADOS EM MEMÓRIA
// Isso armazenará os dados globalmente na simulação
const simulatedWallets: Wallet[] = [
  // Exemplo de caixinha para teste
  { id: 'wallet-001', nome: 'Minha Casa Nido', saldo: 1250.00, idUsuarioPrincipal: 'user_test_id', membros: ['user_test_id'] },
  { id: 'wallet-002', nome: 'Viagem Nido', saldo: 500.00, idUsuarioPrincipal: 'user_test_id', membros: ['user_test_id', 'simulated-user-2'] },
];

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    wallets: [],
    activeWalletId: null,
    activeWallet: null,
  }),
  actions: {
    async fetchWallets() {
      const authStore = useAuthStore();
      if (!authStore.currentUser) {
        this.wallets = [];
        return;
      }
      return new Promise<void>(resolve => {
        setTimeout(() => {
          // Filtra caixinhas onde o usuário atual é membro
          this.wallets = simulatedWallets.filter(wallet =>
            wallet.membros.includes(authStore.currentUser!.id)
          );
          if (this.wallets.length > 0 && !this.activeWalletId) {
            this.setActiveWallet(this.wallets[0].id);
          }
          resolve();
        }, 300); // Simula atraso da API
      });
    },

    async createWallet(newWalletData: { nome: string; idUsuarioPrincipal: string }) {
        const authStore = useAuthStore();
        if (!authStore.currentUser) {
            throw new Error('Usuário não autenticado para criar caixinha.');
        }
        return new Promise<Wallet>(resolve => {
            setTimeout(() => {
                const newWallet: Wallet = {
                    id: `wallet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    nome: newWalletData.nome,
                    saldo: 0,
                    idUsuarioPrincipal: authStore.currentUser.id,
                    membros: [authStore.currentUser.id]
                };
                simulatedWallets.push(newWallet); // Adiciona ao "banco de dados" simulado
                this.wallets.push(newWallet); // Adiciona ao estado local
                this.setActiveWallet(newWallet.id); // Define como ativa
                resolve(newWallet);
            }, 500);
        });
    },

    async joinWallet(walletId: string, userId: string) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const walletToJoin = simulatedWallets.find(w => w.id === walletId);
                if (!walletToJoin) {
                    return reject(new Error('Caixinha não encontrada.'));
                }
                if (walletToJoin.membros.includes(userId)) {
                    return reject(new Error('Você já é membro desta caixinha.'));
                }
                walletToJoin.membros.push(userId); // Adiciona membro no "banco de dados"
                // Garante que o estado local reflita a mudança
                const localWallet = this.wallets.find(w => w.id === walletId);
                if (localWallet) {
                    localWallet.membros.push(userId);
                }
                resolve();
            }, 500);
        });
    },

    setActiveWallet(walletId: string) {
      this.activeWalletId = walletId;
      this.activeWallet = this.wallets.find(w => w.id === walletId) || null;
    },

    updateWalletBalance(walletId: string, newBalance: number) {
      const wallet = this.wallets.find(w => w.id === walletId);
      const simulatedWallet = simulatedWallets.find(w => w.id === walletId);
      if (wallet && simulatedWallet) {
          wallet.saldo = newBalance;
          simulatedWallet.saldo = newBalance; // Atualiza no "BD" simulado
          if (this.activeWalletId === walletId) {
              this.activeWallet!.saldo = newBalance;
          }
      }
    },

    $reset() {
      this.wallets = [];
      this.activeWalletId = null;
      this.activeWallet = null;
      // Note: simulatedWallets NÃO é resetado para simular persistência entre logins do MESMO USUÁRIO.
      // Se fosse multi-usuário e BD real, o reset seria handled pelo BD.
    }
  },
  getters: {
    // Adicionar getters se necessário
  }
});