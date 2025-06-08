// src/plugins/vuetify.ts

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

// Função para detectar o tema preferido do dispositivo
const getPreferredTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'nidoThemeDark' : 'nidoThemeLight';
  }
  return 'nidoThemeLight'; // Padrão se não puder detectar (ex: SSR, navegador antigo)
};

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    defaultTheme: getPreferredTheme(), // ATUALIZADO: Define o tema padrão com base na preferência do dispositivo
    themes: {
      nidoThemeLight: {
        dark: false,
        colors: {
          background: '#FDF7FC',
          surface: '#FFFFFF',
          primary: '#BB2649',
          'primary-darken-1': '#991E3B',
          secondary: '#FCE4EC',
          'secondary-darken-1': '#F8BBD0',
          error: '#EF4444',
          info: '#3B82F6',
          success: '#609966',
          warning: '#FBBF24',
          'text-high-emphasis': '#2C2C2C',
          'text-medium-emphasis': '#555555',
          'border-light': '#EAEAEA',
          'surface-light': '#F5F5F5',
        },
      },
      nidoThemeDark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB2649',
          'primary-darken-1': '#991E3B',
          secondary: '#F8BBD0',
          'secondary-darken-1': '#F4A7C9',
          error: '#EF4444',
          info: '#3B82F6',
          success: '#609966',
          warning: '#FBBF24',
          'text-high-emphasis': '#FDFDFD',
          'text-medium-emphasis': '#CFCFCF',
          'border-light': '#3A3A3A',
          'surface-light': '#2A2A2A',
        },
      },
    },
  },
});

export default vuetify;