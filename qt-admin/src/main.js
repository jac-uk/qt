import { createApp } from 'vue';

import App from '@/App';
import router from '@/router';
import store from '@/store';
import * as filters from '@jac-uk/jac-kit/filters/filters';
import { auth } from '@/firebase';
import * as localFilters from '@/filters';

import * as Sentry from '@sentry/vue';

import './styles/main.scss';

import mitt from 'mitt';
const emitter = mitt();

// Merged filters (localFilters will override filters below in event of naming collisions)
const allFilters = Object.assign({}, filters, localFilters);

let vueInstance = false;
auth.onAuthStateChanged(async (user) => {
  await store.dispatch('auth/setCurrentUser', user);
  if (vueInstance) {
    if (store.getters['auth/isSignedIn']) {
      if (router.currentRoute && router.currentRoute.value.name === 'sign-in') {
        router.push('/');
      }
    } else {
      if (router.currentRoute && router.currentRoute.value.name !== 'sign-in') {
        router.push({ name: 'sign-in' });
      }
    }
  } else {

    // Root instance
    vueInstance = createApp(App)
      .use(router)
      .use(store);

    // Bind global filters before mounting
    vueInstance.config.globalProperties.$filters = allFilters;

    // Bind emitter for global events
    vueInstance.config.globalProperties.emitter = emitter;

    // Root component
    vueInstance.mount('#app');

    // Initialise Sentry
    if (import.meta.env.NODE_ENV !== 'development') {
      Sentry.init({
        app: vueInstance,
        dsn: 'https://ab99abfef6294bc5b564e635d7b7cb4b@sentry.io/1792541',
        environment: store.getters.appEnvironment.toLowerCase(),
        release: import.meta.env.PACKAGE_VERSION, // made available in vue.config.js
        integrations: [
          new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          }),
        ],
      });
    }
  }
});
