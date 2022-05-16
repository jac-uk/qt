export default {
  namespaced: true,
  state: {
    record: {
      id: 'EXERCISE_ID',
      referenceNumber: 'EXERCISE_REF',
      name: 'EXERCISE NAME',
      exerciseMailbox: 'EXERCISE MAILBOX',
      exercisePhoneNumber: '01234 567890',
      emailSignatureName: 'EMAIL SIGNATURE HERE',
    },
  },
  getters: {
    data: (state) => () => {
      return { ...state.record };
    },
  },
};
