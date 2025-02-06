
// Scheduled
import backupFirestore from './scheduledFunctions/backupFirestore.js';
import backupFirestoreWhenBusy from './scheduledFunctions/backupFirestoreWhenBusy.js';
import backupAuthentication from './scheduledFunctions/backupAuthentication.js';

// Background
import onDelete from './backgroundFunctions/onDelete.js';
import onQualifyingTestResponseUpdate from './backgroundFunctions/onQualifyingTestResponseUpdate.js';
import onQualifyingTestUpdate from './backgroundFunctions/onQualifyingTestUpdate.js';

// Callable
import api from './callableFunctions/api.js';
import activateQualifyingTest from './callableFunctions/activateQualifyingTest.js';
import exportQualifyingTestResponses from './callableFunctions/exportQualifyingTestResponses.js';
import initialiseQualifyingTest from './callableFunctions/initialiseQualifyingTest.js';
import logEvent from './callableFunctions/logEvent.js';
import scoreQualifyingTest from './callableFunctions/scoreQualifyingTest.js';
import signIn from './callableFunctions/signIn.js';

// admin call api
import adminCallAPI from './callableFunctions/admin.callAPI.js';

export {
  // Scheduled
  backupFirestore,
  backupFirestoreWhenBusy,
  backupAuthentication,
  // Background
  onDelete,
  onQualifyingTestResponseUpdate,
  onQualifyingTestUpdate,
  // Callable
  api,
  activateQualifyingTest,
  exportQualifyingTestResponses,
  initialiseQualifyingTest,
  logEvent,
  scoreQualifyingTest,
  signIn,
  // admin call api
  adminCallAPI
};
