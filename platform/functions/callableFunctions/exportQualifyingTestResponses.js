import functions from 'firebase-functions';
import { firebase, db, auth } from '../shared/admin.js';
import config from '../shared/config.js';

import initExportQualifyingTestResponses from '../actions/qualifyingTestResponses/export.js';
const { exportQualifyingTestResponses } = initExportQualifyingTestResponses(config, firebase, db);

import { getDocument } from '../shared/helpers.js';

import initLogEvent from '../actions/logs/logEvent.js';
const { logEvent } = initLogEvent(firebase, db, auth);

import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.runWith({
  timeoutSeconds: 60,
  memory: '1GB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // validate input parameters
  if (!(typeof data.qualifyingTestId === 'string') || data.qualifyingTestId.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Please specify an "qualifyingTestId"');
  }

  // log an event
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(data.qualifyingTestId));
  let details = {
    qualifyingTestId: qualifyingTest.id,
    qualifyingTestTitle: qualifyingTest.title,
  };
  let user = {
    id: context.auth.token.user_id,
    name: context.auth.token.name,
  };
  await logEvent('info', 'Qualifying test responses exported', details, user);

  // return the requested data
  return await exportQualifyingTestResponses(data.qualifyingTestId);

});
