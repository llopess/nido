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
