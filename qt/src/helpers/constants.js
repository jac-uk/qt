import {
  STATUS,
  // EXERCISE_STAGE,
  // APPLICATION_STATUS,
  // SHORTLISTING,
  // QUALIFYING_TEST,
  QUALIFYING_TEST_RESPONSE,
  DEFAULT
} from '@jac-uk/jac-kit/helpers/constants';

const QUALIFYING_TEST = {
  TYPE: {
    SCENARIO: 'scenarioTest',
    CRITICAL_ANALYSIS: 'criticalAnalysis',
    SITUATIONAL_JUDGEMENT: 'situationalJudgement',
  },
  STATUS: {
    CREATED: 'created',
    SUBMITTED: 'submitted-for-approval',
    APPROVED: 'approved',
    INITIALISED: 'initialised',
    ACTIVATED: 'activated',
    NOT_STARTED: 'not-started',
    STARTED: 'started',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  },
};

const WELSH_POSTS_CONTACT_MAILBOX = 'enquiries@judicialappointments.gov.uk';
const WELSH_POSTS_EMAIL_SUBJECT = 'Welsh application form request';

export {
  STATUS,
  QUALIFYING_TEST,
  QUALIFYING_TEST_RESPONSE,
  DEFAULT,
  WELSH_POSTS_CONTACT_MAILBOX,
  WELSH_POSTS_EMAIL_SUBJECT
};
