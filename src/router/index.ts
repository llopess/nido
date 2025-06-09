import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false, title: 'Nido | Seu Lar, Suas Finanças' } // Título da aba para a Landing Page
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { requiresAuth: false, title: 'Nido | Entrar ou Registrar' } // Título da aba para Autenticação
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Nido | Dashboard' } // Título da aba para o Dashboard
    },
    {
      path: '/funds',
      name: 'funds',
      component: () => import('@/views/FundsView.vue'),
      meta: { requiresAuth: true, title: 'Nido | Meus Nidos' } // Título da aba para Meus Fundos
    },
    {
      path: '/funds/:type/:id',
      name: 'fund-details',
      component: () => import('@/views/FundDetailsView.vue'),
      props: true,
      meta: { requiresAuth: true, title: 'Nido | Detalhes do Nido' } // Título da aba para Detalhes do Fundo
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
      meta: { title: 'Nido | Página Não Encontrada' } // Título da aba para rotas não encontradas
    },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string || 'Nido')

  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;
  const requiresAuth = to.meta.requiresAuth;
  const isAuthPage = to.name === 'auth';
  const isLandingPage = to.name === 'landing';

  if (requiresAuth && !isLoggedIn) {
    if (to.path !== '/auth') {
      next('/auth');
    } else {
      next();
    }
  } else if (isLoggedIn && (isAuthPage || isLandingPage)) {
    if (to.path !== '/dashboard') {
      next('/dashboard');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
