module.exports = {
  PROJECT_ID: process.env.PROJECT_ID,
  QT_URL: 'https://europe-west2-jac-qualifying-tests-develop.cloudfunctions.net/api/v1',
  QT_KEY: 'secret',
  QUALIFYING_TEST: {
    TYPE: {
      SCENARIO: 'scenario',
      CRITICAL_ANALYSIS: 'criticalAnalysis',
      SITUATIONAL_JUDGEMENT: 'situationalJudgement',
    },
    MODE: {
      DRY_RUN: 'dry-run',
      MOP_UP: 'mop-up',
    },
    STATUS: {
      CREATED: 'created',
      SUBMITTED: 'submitted-for-approval',
      APPROVED: 'approved',
      INITIALISED: 'initialised',
      ACTIVATED: 'activated',
      PAUSED: 'paused',
      COMPLETED: 'completed',
    },
  },
  QUALIFYING_TEST_RESPONSES: {
    STATUS: {
      CREATED: 'created',
      ACTIVATED: 'activated',
      STARTED: 'started',
      COMPLETED: 'completed',
    },
  },
  STORAGE_URL: process.env.PROJECT_ID + '.appspot.com',
};
