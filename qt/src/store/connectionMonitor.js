/**
 * Here we use Realtime Database to monitor user's connection
 */
import { TIMESTAMP } from '@firebase/firestore';
import { ref as dbRef } from '@firebase/database';
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
      const userStatusDatabaseRef = dbRef(database, userStatusPath);
      // TODO:
      await dbRef(database, '.info/connected').on('value', (snapshot) => {
        if (snapshot.val() == false) {
          return;
        }
        context.commit('setStarted', true);
        const sessionRef = userStatusDatabaseRef.push();
        lastSessionPath = `${userStatusPath}/${sessionRef.key}`;
        sessionRef.child('offline').onDisconnect().set(TIMESTAMP).then(() => {
          sessionRef.child('online').set(TIMESTAMP);
        });
      });
    },
    stop: async (context) => {
      context.commit('setStarted', false);
      if (lastSessionPath) {
        dbRef(database, lastSessionPath).child('offline').set(TIMESTAMP);
      }
      dbRef(database, '.info/connected').off();
    },
    checkConnectedOnce: async (context) => {
      await dbRef(database, '.info/connected').once('value', (snapshot) => {
        if (snapshot.val() === true) {
          context.commit('setConnectedOnce', true);
        }
        else {
          context.commit('setConnectedOnce', false);
        }
      });
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
