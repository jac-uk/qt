import { createStore } from 'vuex';

// Vuex modules
import auth from '@/store/auth';
import qualifyingTestResponse from '@/store/qualifyingTestResponse';
import qualifyingTestResponses from '@/store/qualifyingTestResponses';
import logs from '@/store/logs';
import connectionMonitor from '@/store/connectionMonitor';
import session from '@/store/session';
import packageContent from '../../package.json';

const store = createStore({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: import.meta.env.NODE_ENV !== 'production',
  modules: {
    auth,
    qualifyingTestResponse,
    qualifyingTestResponses,
    logs,
    connectionMonitor,
    session,
  },
  state: {
    packageVersion: packageContent.version || '0',
    env: import.meta.env.NODE_ENV,
  },
  mutations: {},
  actions: {},
  getters: {
    appVersion: (state) => {
      return state.packageVersion;
    },
    whichEnv: (state) => {
      return state.env;
    },
  },
});

export default store;
