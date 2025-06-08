<template>
  <v-app>
    <!-- Barra de Navegação Superior -->
    <v-app-bar app :color="theme.global.current.value.dark ? 'surface' : 'primary'" dark>
      <!-- Ícone do Hamburger para Mobile (visível apenas em telas pequenas) -->
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-flex d-md-none"></v-app-bar-nav-icon>

      <v-toolbar-title class="text-h5 font-weight-bold">
        <router-link to="/" style="text-decoration: none;">
          <img 
            :src="logoSrc" 
            alt="Logo do Nido" 
            class="nido-logo"
          />
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Botão para alternar tema (visível em todas as telas) -->
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-gibbous' }}</v-icon>
      </v-btn>

      <!-- Links de Navegação Principal (visíveis apenas em telas grandes) -->
      <div class="d-none d-md-flex">
        <v-btn v-if="authStore.isLoggedIn" text to="/dashboard" class="text-white">Dashboard</v-btn>
        <v-btn v-if="authStore.isLoggedIn" text to="/wallets" class="text-white">Caixinhas</v-btn>
        
        <!-- Botão para Entrar/Registrar ou Sair -->
        <v-btn v-if="!authStore.isLoggedIn" text to="/auth" class="text-white">Entrar/Registrar</v-btn>
        <v-btn v-else text @click="handleLogout" class="text-white">Sair</v-btn>
      </div>
    </v-app-bar>

    <!-- Navigation Drawer (Menu Hamburger) -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item class="px-2">
            <v-list-item-avatar>
                <img :src="logoSrc" alt="Logo do Nido" class="nido-logo-drawer">
            </v-list-item-avatar>
            <v-list-item-title class="text-h6 font-weight-bold text-primary">Nido</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item v-if="authStore.isLoggedIn" link to="/dashboard" @click="drawer = false">
          <template v-slot:prepend><v-icon>mdi-view-dashboard</v-icon></template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="authStore.isLoggedIn" link to="/wallets" @click="drawer = false">
          <template v-slot:prepend><v-icon>mdi-wallet</v-icon></template>
          <v-list-item-title>Caixinhas</v-list-item-title>
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

    <!-- Conteúdo Principal da Aplicação (Onde as views são carregadas) -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Floating Action Button (FAB) para Registrar Transação -->
    <v-btn
      v-if="authStore.isLoggedIn && walletStore.activeWalletId && $route.name !== 'auth' && $route.name !== 'landing'"
      class="fixed bottom-6 right-6 z-50 rounded-full elevation-10"
      color="primary"
      fab
      size="large"
      @click="showTransactionModal = true"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <!-- Modal para Registrar Transação -->
    <v-dialog v-model="showTransactionModal" max-width="500px">
      <v-card color="surface">
        <v-toolbar color="primary" flat>
          <v-toolbar-title class="text-h5 text-white">Registrar Nova Transação</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showTransactionModal = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="text-medium-emphasis mb-4">
            Adicione uma transação para a caixinha:
            <span class="font-weight-bold text-primary">{{ walletStore.activeWallet ? walletStore.activeWallet.nome : 'Nenhuma selecionada' }}</span>
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
            <v-alert v-if="globalTransactionMessage" :type="globalTransactionMessageType" class="mt-4">{{ globalTransactionMessage }}</v-alert>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Rodapé -->
    <v-footer app :color="theme.global.current.value.dark ? 'surface' : 'surface-light'" :class="{'text-text-medium-emphasis': !theme.global.current.value.dark, 'text-gray-400': theme.global.current.value.dark}">
      <v-container class="text-center">
        &copy; {{ new Date().getFullYear() }} Nido App. Todos os direitos reservados.
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore, useWalletStore, useTransactionStore } from '@/stores';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from 'vuetify';

const authStore = useAuthStore();
const walletStore = useWalletStore();
const transactionStore = useTransactionStore();
const router = useRouter();
const route = useRoute();
const theme = useTheme();

const drawer = ref(false); // Variável para controlar o navigation drawer

const showTransactionModal = ref(false);
const newGlobalTransaction = ref({
  tipo: 'despesa',
  valor: 0,
  descricao: '',
  categoriaNome: '',
});
const globalTransactionMessage = ref('');
const globalTransactionMessageType = ref<'success' | 'error' | 'info'>('info');

const rules = {
  required: (value: any) => (value !== null && value !== undefined && value !== '') || 'Campo obrigatório.',
  positive: (value: number) => value > 0 || 'O valor deve ser positivo.',
};

// URL da imagem de placeholder para o logo do Nido
const logoSrc = ref('bg.png');

authStore.initializeAuth();

const handleLogout = () => {
  authStore.logout();
  walletStore.$reset();
  transactionStore.$reset();
  router.push('/auth');
};

const handleLogoutAndCloseDrawer = () => {
  handleLogout();
  drawer.value = false; // Fecha o drawer após o logout
};

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'nidoThemeLight' : 'nidoThemeDark';
};

const addGlobalTransaction = async () => {
  if (!walletStore.activeWalletId || !authStore.currentUser) {
    showGlobalMessage('Selecione uma caixinha ativa no Dashboard/Caixinhas para registrar transações.', true);
    return;
  }

  const value = newGlobalTransaction.value.valor;
  const description = newGlobalTransaction.value.descricao;
  const categoryName = newGlobalTransaction.value.categoriaNome;

  if (!value || isNaN(value) || value <= 0 || !description || !categoryName) {
    showGlobalMessage('Por favor, preencha todos os campos corretamente.', true);
    return;
  }

  try {
    const transaction = {
      id: `trans-${Date.now()}`,
      idCaixinha: walletStore.activeWalletId,
      idUsuario: authStore.currentUser.id,
      valor: value,
      tipo: newGlobalTransaction.value.tipo,
      descricao: description,
      categoriaNome: categoryName,
      dataTransacao: new Date().toISOString(),
    };
    await transactionStore.addTransaction(transaction, walletStore.activeWalletId);
    
    if (walletStore.activeWallet) {
        let newBalance = walletStore.activeWallet.saldo;
        if (transaction.tipo === 'ganho') {
            newBalance += transaction.valor;
        } else {
            newBalance -= transaction.valor;
        }
        walletStore.updateWalletBalance(walletStore.activeWallet.id, newBalance);
    }

    showGlobalMessage('Transação registrada com sucesso!', false);
    newGlobalTransaction.value = { tipo: 'despesa', valor: 0, descricao: '', categoriaNome: '' };
    showTransactionModal.value = false;
    
    if (route.name === 'dashboard' && authStore.isLoggedIn && walletStore.activeWalletId) {
        await walletStore.fetchWallets(); 
        await transactionStore.fetchTransactions(walletStore.activeWalletId);
    } else if (route.name === 'wallet-details' && authStore.isLoggedIn && walletStore.activeWalletId) {
        await walletStore.fetchWallets(); 
        await transactionStore.fetchTransactions(walletStore.activeWalletId);
    }

  } catch (error) {
    showGlobalMessage(`Erro ao registrar transação: ${error.message}`, true);
  }
};

const showGlobalMessage = (msg: string, isError: boolean) => {
  globalTransactionMessage.value = msg;
  globalTransactionMessageType.value = isError ? 'error' : 'success';
  setTimeout(() => {
    globalTransactionMessage.value = '';
  }, 5000);
};
</script>

<style scoped>
/* Estilo para a imagem do logo no cabeçalho */
.nido-logo {
  max-height: 90px; /* Ajuste a altura máxima conforme necessário */
  width: auto; /* Mantém a proporção */
  filter: brightness(0) invert(1); /* Torna o logo branco para contrastar com o primary (bordô) */
}

/* Estilo para a imagem do logo no drawer */
.nido-logo-drawer {
    max-height: 32px;
    width: auto;
    margin-right: 8px; /* Espaço entre o logo e o título no drawer */
}

/* Garante que o router-link não tenha sublinhado */
.text-white {
  text-decoration: none;
}
</style>