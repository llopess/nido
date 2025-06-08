import { defineStore } from 'pinia';

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    isLoggedIn: false,
  }),
  actions: {
    login(user: User) {
      this.currentUser = user;
      this.isLoggedIn = true;
      // Em uma aplicação real, aqui você armazenaria o token/ID em localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout() {
      this.currentUser = null;
      this.isLoggedIn = false;
      localStorage.removeItem('currentUser');
    },
    initializeAuth() {
      // Tenta carregar o usuário do localStorage ao iniciar a aplicação
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          this.isLoggedIn = true;
        } catch (e) {
          console.error("Erro ao parsear usuário do localStorage", e);
          this.logout(); // Limpa se houver erro
        }
      }
    }
  },
  getters: {
    // Você pode adicionar getters se precisar de dados computados do estado
  }
});