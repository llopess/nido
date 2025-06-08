import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores'; // Pinia importado
import vuetify from './plugins/vuetify'; // Vuetify importado

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');