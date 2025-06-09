<template>
  <v-container fluid fill-height class="d-flex align-center justify-center bg-background">
    <v-card class="elevation-12" width="400">
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="text-h5 text-white">{{
          isRegisterMode ? 'Cadastre-se' : 'Entrar'
        }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="email"
            label="Email"
            name="email"
            prepend-icon="mdi-email"
            type="email"
            :rules="[rules.required, rules.email]"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Senha"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
            :rules="[rules.required, rules.minPassword]"
            required
          ></v-text-field>

          <v-text-field
            v-if="isRegisterMode"
            v-model="name"
            label="Nome"
            name="name"
            prepend-icon="mdi-account"
            type="text"
            :rules="[rules.required]"
            required
          ></v-text-field>

          <v-alert v-if="message" :type="messageType" class="mt-4">{{ message }}</v-alert>

          <v-card-actions class="px-0 pt-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" type="submit">{{
              isRegisterMode ? 'Registrar' : 'Entrar'
            }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center pb-5">
        <v-btn text @click="toggleMode" color="primary">
          {{ isRegisterMode ? 'Já tem uma conta? Entrar' : 'Ainda não tem uma conta? Cadastre-se' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isRegisterMode = ref(false)
const email = ref('')
const password = ref('')
const name = ref('')
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório.',
  email: (value: string) => /.+@.+\..+/.test(value) || 'Email inválido.',
  minPassword: (value: string) => value.length >= 6 || 'A senha deve ter no mínimo 6 caracteres.',
}

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  message.value = ''
}

const handleSubmit = async () => {
  message.value = ''
  try {
    if (isRegisterMode.value) {
      const response = {
        data: {
          message: 'Usuário registrado com sucesso!',
          user: { id: Date.now().toString(), nome: name.value, email: email.value },
        },
      }
      message.value = response.data.message
      messageType.value = 'success'

      isRegisterMode.value = false
      email.value = ''
      password.value = ''
      name.value = ''
    } else {
      if (email.value === 'teste@email.com' && password.value === '123456') {
        const user = { id: 'user_test_id', nome: 'Usuário Teste', email: 'teste@email.com' }
        authStore.login(user)
        router.push('/')
      } else {
        throw new Error('Email ou senha incorretos (simulado).')
      }
    }
  } catch (error: any) {
    message.value = error.message || 'Ocorreu um erro.'
    messageType.value = 'error'
  }
}
</script>
