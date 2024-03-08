/**
 * Here we use Realtime Database to monitor user's connection
 */
import { child ,onDisconnect, set, off, get, ref, onValue, push, serverTimestamp } from '@firebase/database';
import { database, auth } from '@/firebase';

let lastSessionPath = '';

export default {
  namespaced: true,
  actions: {
    start: async (context, ref) => {
      if (context.state.started) {
        return;
      }
      const userId = auth.currentUser.uid;
      const userStatusPath = `/${ref}/userStatus/${userId}`;
      const userStatusDatabaseRef = ref(database, userStatusPath);
      await onValue(ref(database, '.info/connected'), (snapshot) => {
        if (snapshot.val() == false) {
          return;
        }
        context.commit('setStarted', true);
        const sessionRef = push(userStatusDatabaseRef);
        lastSessionPath = `${userStatusPath}/${sessionRef.key}`;
        onDisconnect(child(sessionRef, 'offline')).set(serverTimestamp()).then(() => {
          set(child(sessionRef, 'online'), serverTimestamp());
        });
      });
    },
    stop: async (context) => {
      context.commit('setStarted', false);
      if (lastSessionPath) {
        await set(child(ref(database, lastSessionPath), 'offline'), serverTimestamp());
      }
      off(ref(database, '.info/connected'));
    },
    checkConnectedOnce: async (context) => {
      const snapshot = await get(ref(database, '.info/connected'));
      if (snapshot.val() === true) {
        context.commit('setConnectedOnce', true);
      }
      else {
        context.commit('setConnectedOnce', false);
      }
    },
  },
  mutations: {
    setStarted(state, started) {
      state.started = started;
    },
    setConnectedOnce(state, connectedOnce) {
      state.connectedOnce = connectedOnce;
    },
  },
  getters: {
    isConnectedOnce: (state) => {
      return state.connectedOnce;
    },
  },
  state: {
    started: false,
    connectedOnce: false,
  },
};
