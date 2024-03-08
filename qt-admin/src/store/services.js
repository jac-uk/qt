import { firestore } from '@/firebase';
import { doc, updateDoc } from '@firebase/firestore';
import { firestoreAction } from '@/helpers/vuexfireJAC';
import vuexfireSerialize from '@jac-uk/jac-kit/helpers/vuexfireSerialize';

export default {
  namespaced: true,
  actions: {
    bind: firestoreAction(({ bindFirestoreRef }) => {
      const firestoreRef = doc(firestore, 'settings/services');
      return bindFirestoreRef('record', firestoreRef, { serialize: vuexfireSerialize });
    }),
    unbind: firestoreAction(({ unbindFirestoreRef }) => {
      return unbindFirestoreRef('record');
    }),
    saveNotificationsSettings: async (context, data) => {
      const ref = doc(firestore, 'settings/services');
      await updateDoc(ref, { notifications: data });
    },
    notificationsStart() {
      return updateDoc(doc(firestore, 'settings/services'), {
        'notifications.isProcessing': true,
      });
    },
    notificationsStop() {
      return updateDoc(doc(firestore, 'settings/services'), {
        'notifications.isProcessing': false,
      });
    },
  },
  mutations: {
    set(state, { name, value }) {
      state[name] = value;
    },
  },
  state: {
    record: null,
  },
  getters: {
    getNotificationSettings: (state) => {
      return state.record && state.record.notifications;
    },
  },
};
