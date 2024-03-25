/**
 * Here we use Realtime Database to monitor user's connection
 */
import { database } from '@/firebase';
import { ref, onValue } from '@firebase/database';

export default {
  namespaced: true,
  actions: {
    bind: async (context, params ) => {
      const queryRef = ref(database, `qualifyingTest/${params.qualifyingTestId}/userStatus/${params.participantId}`);
      onValue(queryRef, snap => {
        const results = snap.val();
        if (results) {
          const logList = [];
          Object.keys(results).forEach(log => {
            const result = results[log];
            const resultsReturn = {
              online: result.online,
              offline: result.offline,
              on: new Date(result.online),
              off: result.offline ? new Date(result.offline) : '',
            };
            logList.push(resultsReturn);
          });
          context.commit(
            'setRecords',
            logList.sort((a, b) => {
              if (a.online < b.online) {
                return -1;
              }
              if (a.online > b.online) {
                return 1;
              }
              return 0;
            })
          );
        }
      });
    },
  },
  mutations: {
    setRecords(state, records) {
      state.records = records;
    },
  },
  state: {
    records: [],
  },
};
