import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
Vue.use(Vuex);

// Vuex modules
import auth from '@/store/auth';
import qualifyingTestResponse from '@/store/qualifyingTestResponse';
import qualifyingTestResponses from '@/store/qualifyingTestResponses';
import logs from '@/store/logs';
import connectionMonitor from '@/store/connectionMonitor';
import session from '@/store/session';

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    qualifyingTestResponse,
    qualifyingTestResponses,
    logs,
    connectionMonitor,
    session,
  },
  state: {
    packageVersion: process.env.PACKAGE_VERSION || '0',
    env: process.env.NODE_ENV,
  },
  mutations: {
    ...vuexfireMutations,
  },
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
