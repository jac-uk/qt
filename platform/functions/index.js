
// Scheduled
import backupFirestore from './scheduledFunctions/backupFirestore';
import backupFirestoreWhenBusy from './scheduledFunctions/backupFirestoreWhenBusy';
import backupAuthentication from './scheduledFunctions/backupAuthentication';

// Background
import onDelete from './backgroundFunctions/onDelete';
import onQualifyingTestResponseUpdate from './backgroundFunctions/onQualifyingTestResponseUpdate';
import onQualifyingTestUpdate from './backgroundFunctions/onQualifyingTestUpdate';

// Callable
import api from './callableFunctions/api';
import activateQualifyingTest from './callableFunctions/activateQualifyingTest';
import exportQualifyingTestResponses from './callableFunctions/exportQualifyingTestResponses';
import initialiseQualifyingTest from './callableFunctions/initialiseQualifyingTest';
import logEvent from './callableFunctions/logEvent';
import scoreQualifyingTest from './callableFunctions/scoreQualifyingTest';
import signIn from './callableFunctions/signIn';

// admin call api
import adminCallAPI from './callableFunctions/admin.callAPI';

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
}
