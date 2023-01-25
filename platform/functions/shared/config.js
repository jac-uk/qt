const functions = require('firebase-functions');

module.exports = {
  PROJECT_ID: functions.config().project.id,
  QT_URL: `https://europe-west2-${functions.config().project.id}.cloudfunctions.net/api/v1`,
  QT_KEY: functions.config().qts.key,
  QUALIFYING_TEST: {
    TYPE: {
      SCENARIO: 'scenarioTest',
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
      STARTED: 'started',
      PROGRESS: 'in-progress',
      COMPLETED: 'completed',
    },
  },
  QUALIFYING_TEST_RESPONSES: {
    STATUS: {
      CREATED: 'created',
      ACTIVATED: 'activated',
      STARTED: 'started',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
  },
  STORAGE_URL: functions.config().project.id + '.appspot.com',
  SLACK_URL: functions.config().slack.url,
};
