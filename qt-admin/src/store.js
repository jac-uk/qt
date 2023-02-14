import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations, firestoreOptions } from 'vuexfire';
Vue.use(Vuex);
firestoreOptions.wait = true;

// Vuex modules
import auth from '@/store/auth';
import services from '@/store/services';
import clipboard from '@/store/clipboard';

import exerciseDocument from '@/store/exerciseDocument';  // TODO remove this

import folders from '@/store/folders/collection';
import folder from '@/store/folders/document';
import qualifyingTest from '@/store/qualifyingTest/qualifyingTest';
import qualifyingTestResponses from '@/store/qualifyingTest/qualifyingTestResponses';
import connectionMonitor from '@/store/connectionMonitor';

const store = new Vuex.Store({
  // Don't use strict mode in production for performance reasons (https://vuex.vuejs.org/guide/strict.html)
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    auth,
    services,
    clipboard,
    exerciseDocument,
    folders,
    folder,
    qualifyingTest,
    qualifyingTestResponses,
    connectionMonitor,
  },
  state: {
    packageVersion: process.env.PACKAGE_VERSION || '0',
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {},
  getters: {
    appVersion: (state) => {
      return state.packageVersion;
    },
    appEnvironment: () => {
      const projectId = process.env.VUE_APP_FIREBASE_PROJECT_ID;
      if (projectId.indexOf('-develop') >= 0) {
        return 'DEVELOP';
      }
      if (projectId.indexOf('-live') >= 0) {
        return 'LIVE';
      }
      return '';
    },
    isLive: (state, getters) => {
      return getters.appEnvironment === 'LIVE';
    },
  },
});

export default store;
