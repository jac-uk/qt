import { auth } from '@/firebase';

const module = {
  namespaced: true,
  state: {
    currentUser: null,
    authError: null,
  },
  mutations: {
    setCurrentUser(state, user) {
      state.currentUser = user;
    },
    setAuthError(state, message) {
      state.authError = message;
    },
  },
  actions: {
    async setCurrentUser({ state, commit }, user) {
      if (user === null) {
        commit('setCurrentUser', null);
      } else {
        if (state.authError) {
          commit('setAuthError', null);
        }
        let allOk = false;
        if (user.email.indexOf('@judicialappointments.gov.uk') > 0) {
          allOk = true;
        } else if ([
          'warren.searle@judicialappointments.digital',
          'tom.russell@judicialappointments.digital',
          'halcyon@judicialappointments.digital',
          'drie@judicialappointments.digital',
        ].indexOf((user.email).toLowerCase()) >= 0) {
          allOk = true;
        }
        if (allOk) {
          let role = 'staff';
          if (
            [
              'warren.searle@judicialappointments.digital',
              'tom.russell@judicialappointments.digital',
              'nick.addy@judicialappointments.gov.uk',
              'halcyon@judicialappointments.digital',
              'drie@judicialappointments.digital',
            ].indexOf((user.email).toLowerCase() >= 0)
          ) {
            role = 'superadmin';
          }
          commit('setCurrentUser', {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            role: role,
          });
        } else {
          auth.signOut();
          commit('setAuthError', 'This site is restricted to employees of the Judicial Appointments Commission');
        }
      }
    },
  },
  getters: {
    isSignedIn(state) {
      return (state.currentUser !== null);
    },
    getEmail(state) {
      return state.currentUser.email;
    },
  },
};

export default module;
