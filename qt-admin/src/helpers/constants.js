import {
  EXERCISE_STAGE,
  QUALIFYING_TEST_RESPONSE
} from '@jac-uk/jac-kit/helpers/constants';

const QUALIFYING_TEST = {
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
    NOT_STARTED: 'not-started',
    STARTED: 'started',
    PROGRESS: 'progress',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  },
};

export {
  EXERCISE_STAGE,
  QUALIFYING_TEST,
  QUALIFYING_TEST_RESPONSE
};
