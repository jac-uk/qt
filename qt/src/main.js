import { createApp } from 'vue';

import App from '@/App';
import router from '@/router';
import store from '@/store';
import * as filters from '@/filters';
import { auth } from '@/firebase';

import mitt from 'mitt';

/**
 * Mitt is used to replace the event bus, which is no longer supported in Vue3.
 * Ultimately this should be replaced by another pattern.
 * See: https://v3-migration.vuejs.org/breaking-changes/events-api.html
 */
const emitter = mitt();

let vueInstance = false;

auth.onAuthStateChanged( async (user) => {
  await store.dispatch('auth/setCurrentUser', user);
  if (vueInstance) {
    if (store.getters['auth/isSignedIn']) {
      if (router.currentRoute && router.currentRoute.value.name === 'sign-in') {
        router.push({ name: 'online-tests' });
      }
    } else {
      router.push({ name: 'signed-out' });
    }
  } else {
    // Root instance
    vueInstance = createApp(App)
      .use(router)
      .use(store);

    // Bind global filters before mounting
    vueInstance.config.globalProperties.$filters = filters;

    // Bind emitter for global events
    vueInstance.config.globalProperties.emitter = emitter;

    // Root component
    vueInstance.mount('#app');
  }
});
