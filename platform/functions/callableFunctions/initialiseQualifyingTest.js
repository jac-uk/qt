import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';

import initInitialiseQualifyingTest from '../actions/qualifyingTests/initialiseQualifyingTest.js';
const initialiseQualifyingTest = initInitialiseQualifyingTest(config, firebase, db);

import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 300,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    qualifyingTestId: { required: true },
    stage: { required: false },
    status: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return initialiseQualifyingTest(data);
});
