import { firestore } from '@/firebase';
import { collection, query, where, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from '@firebase/firestore';
import { firestoreAction } from '@/helpers/vuexfireJAC';
import vuexfireSerialize from '@jac-uk/jac-kit/helpers/vuexfireSerialize';
import clone from 'clone';
import { QUALIFYING_TEST } from '@/helpers/constants';
import tableQuery from '@jac-uk/jac-kit/components/Table/tableQuery';

const collectionRef = collection(firestore, 'qualifyingTests');

export default {
  namespaced: true,
  actions: {
    bind: firestoreAction(({ bindFirestoreRef }, id) => {
      const firestoreRef = doc(collectionRef, id);
      return bindFirestoreRef('record', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbind: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('record');
    }),
    bindQTs: firestoreAction(({ bindFirestoreRef, state }, params) => {
      let firestoreRef = query(collectionRef, where('folderId', '==', params.folderId));
      firestoreRef = tableQuery(state.records, firestoreRef, params);
      return bindFirestoreRef('records', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbindQTs: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('records');
    }),
    create: async (state, data) => {
      data.created = serverTimestamp();
      data.status = QUALIFYING_TEST.STATUS.CREATED;
      data.lastUpdated = null;
      data.counts = {};
      const doc = await addDoc(collectionRef, data);
      return doc.id;
    },
    save: async ({ state }, data) => {
      data.lastUpdated = serverTimestamp();
      return await updateDoc(doc(collectionRef, state.record.id), data);
    },
    submitForApproval: async ({ state }) => {
      const data = {
        status: QUALIFYING_TEST.STATUS.SUBMITTED,
      };
      await updateDoc(doc(collectionRef, state.record.id), data);
    },
    approve: async ({ state }) => {
      const data = {
        status: QUALIFYING_TEST.STATUS.APPROVED,
      };
      await updateDoc(doc(collectionRef, state.record.id), data);
    },
    copy: async (context) => {
      const qualifyingTest = context.state.record;
      const data = context.getters.data();
      data.title += ' copy';
      data.mode = 'mop-up';
      data.relationship = {
        copiedFrom: qualifyingTest.id,
      };
      data.startDate = null;
      data.endDate = null;
      const newId = await context.dispatch('create', data);
      return newId;
    },
    delete: async ({ state }) => {
      await deleteDoc(doc(collectionRef, state.record.id));
    },
  },
  mutations: {
    set(state, { name, value }) {
      state[name] = value;
    },
  },
  state: {
    record: null,
    records: [],
  },
  getters: {
    id: (state) => {
      if (state.record === null) return null;
      return state.record.id;
    },
    data: (state) => () => {
      return clone(state.record);
    },
    getById: (state) => (id) => {
      // TODO if we don't have document then get it from firestore
      return state.records.find(item => item.id === id);
    },
    getCompletedQTs: (state) => {
      return state.records.filter(qualifyingTest => {
        return qualifyingTest.status === QUALIFYING_TEST.STATUS.COMPLETED
          && qualifyingTest.mode !== QUALIFYING_TEST.MODE.MOP_UP;
      });
    },
    getActivatedQTs: (state) => {
      return state.records.filter(qualifyingTest => {
        return qualifyingTest.status === QUALIFYING_TEST.STATUS.ACTIVATED;
      });
    },
  },
};
