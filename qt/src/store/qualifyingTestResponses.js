import { firestore } from '@/firebase';
import { collection, where, query, limit } from '@firebase/firestore';

import { firestoreAction } from '@/helpers/vuexfireJAC';
import vuexfireSerialize from '@/helpers/vuexfireSerialize';

const collectionRef = collection(firestore, 'qualifyingTestResponses');

export default {
  namespaced: true,
  actions: {
    bind: firestoreAction(({ bindFirestoreRef, rootState }) => {
      let firestoreRef = query(collectionRef, where( 'participant.email', '==', rootState.auth.currentUser.email));
      firestoreRef = query(firestoreRef, limit(100));
      return bindFirestoreRef('records', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbind: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('records');
    }),
    bindDryRuns: firestoreAction(({ bindFirestoreRef, rootState }) => {
      let firestoreRef = query(collectionRef, where('participant.email', '==', rootState.auth.currentUser.email));
      firestoreRef = query(collectionRef, limit(100));
      return bindFirestoreRef('dryRuns', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbindDryRuns: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('dryRuns');
    }),
  },
  state: {
    records: [],
    dryRuns: [],
  },
  mutations: {
    set(state, { name, value }) {
      state[name] = value;
    },
  },
};
