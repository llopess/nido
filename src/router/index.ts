import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wallets', // Nova rota para listar caixinhas
      name: 'wallets',
      component: () => import('@/views/WalletsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wallets/:id', // Nova rota para detalhes da caixinha (com ID dinâmico)
      name: 'wallet-details',
      component: () => import('@/views/WalletDetailsView.vue'),
      props: true, // Permite que o ID da rota seja passado como prop
      meta: { requiresAuth: true }
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, from, next) => {
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