import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// Opcional: exportar stores individuais para fácil importação em outros lugares
export * from './auth';
export * from './wallet';
export * from './transaction';