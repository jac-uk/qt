import { firestore, auth } from '@/firebase';
// TODO: KO JACvuexfire
import { firestoreAction } from 'vuexfire';
import { doc, collection, serverTimestamp, Timestamp, updateDoc } from '@firebase/firestore';
import clone from 'clone';
import vuexfireSerialize from '@/helpers/vuexfireSerialize';
import { QUALIFYING_TEST_RESPONSE } from '@/helpers/constants';
import { helperTimeLeft } from '@/helpers/date';

const collectionRef = collection(firestore, 'qualifyingTestResponses');

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
    save: async ({ state, getters }, data) => {
      // @TODO make sure QT is still open
      if (
        state.record.status === QUALIFYING_TEST_RESPONSE.STATUS.ACTIVATED
        || (state.record.status === QUALIFYING_TEST_RESPONSE.STATUS.STARTED && getters.timeLeft)
      ) {
        data.lastUpdated = serverTimestamp();
        data.lastUpdatedClientTime = Timestamp.now();
        return await updateDoc(doc(collectionRef, state.record.id), data);
      }
      return false;
    },
    startTest: async (context) => {
      // collect browser info
      const client = {};
      try {
        if (navigator) {
          client.userAgent = 'userAgent' in navigator ? navigator.userAgent : '';
          client.platform = 'platform' in navigator ? navigator.platform : '';
          client.cookieEnabled = 'cookieEnabled' in navigator ? navigator.cookieEnabled : '';
          client.deviceMemory = 'deviceMemory' in navigator ? navigator.deviceMemory : '';
        }
        client.timestamp = Timestamp.now();
        client.timezone = Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
        client.utcOffset = new Date().getTimezoneOffset();
      } catch {
        client.noData = true;
      }
      const data = {
        status: QUALIFYING_TEST_RESPONSE.STATUS.STARTED,
        'statusLog.started': serverTimestamp(),
        'participant.id': auth.currentUser.uid,
        client: client,
      };
      await context.dispatch('save', data);
    },
    outOfTime: async (context) => {
      const data = {
        status: QUALIFYING_TEST_RESPONSE.STATUS.COMPLETED,
        'statusLog.completed': serverTimestamp(),
        'isOutOfTime': true,
      };
      await context.dispatch('save', data);
    },
  },
  state: {
    record: null,
  },
  getters: {
    id: (state) => {
      if (state.record === null) return null;
      return state.record.id;
    },
    data: (state) => () => {
      return clone(state.record);
    },
    isOpen: (state) => {
      if (state.record.qualifyingTest.startDate && state.record.qualifyingTest.endDate) {
        const today = new Date();

        return today > state.record.qualifyingTest.startDate && today < state.record.qualifyingTest.endDate;
      }
      return false;
    },
    isCompleted: (state) => {
      if (state.record.status === QUALIFYING_TEST_RESPONSE.STATUS.COMPLETED) return true;
      if (!state.record.statusLog.completed) return false;
      if (
        state.record.statusLog.reset
        && state.record.statusLog.reset > state.record.statusLog.completed
      ) {
        return false;
      }
      return true;
    },
    timeLeft: (state) => {
      return helperTimeLeft(state.record);
    },
    testInProgress: (state, getters) => {
      return state.record.status === QUALIFYING_TEST_RESPONSE.STATUS.STARTED
        && state.record.statusLog
        && state.record.statusLog.started
        && getters.isOpen === true
        && getters.timeLeft > 0;
    },
  },
};
