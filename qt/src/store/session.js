/**
 * Here we use Realtime Database to get server time offset
 */
import 'firebase/database';
import { database } from '@/firebase';
import { ref, onValue } from '@firebase/database';

const module = {
  namespaced: true,
  actions: {
    async load(context) {
      // We are calling both `once` and `on` here so that we wait for offset and respond to changes
      // TODO changing computer time does not get picked up by this...even if we call `.off()`. Possibly need to do a write first?
      const recordRef = ref(database, '.info/serverTimeOffset');

      // calling for `once`
      onValue(recordRef, (snapshot) => {
        context.commit('setServerTimeOffset', snapshot.val());

      }, {
        onlyOnce: true,
      });

      // calling for `on`
      onValue(recordRef, (snapshot) => {
        context.commit('setServerTimeOffset', snapshot.val());
      });
    },
  },
  mutations: {
    setServerTimeOffset(state, offset) {
      state.serverTimeOffset = offset;
    },
  },
  state: {
    serverTimeOffset: 0,
  },
};

export default module;
