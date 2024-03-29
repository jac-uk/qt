const module = {
  namespaced: true,
  state: {
    currentUser: null,
  },
  mutations: {
    setCurrentUser(state, user) {
      state.currentUser = user;
    },
  },
  actions: {
    setCurrentUser({ commit }, user) {
      if (user === null) {
        commit('setCurrentUser', null);
      } else {
        commit('setCurrentUser', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
        });
      }
    },
  },
  getters: {
    isSignedIn(state) {
      return (state.currentUser !== null);
    },
    getEmail(state) {
      if (state.currentUser) {
        return state.currentUser.email;
      }
      return null;
    },
  },
};

export default module;
