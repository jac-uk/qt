const functions = require('firebase-functions');
const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const scoreQualifyingTest = require('../actions/qualifyingTests/scoreQualifyingTest')(config, firebase, db);
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.runWith({
  timeoutSeconds: 300,
  memory: '512MB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  if (!checkArguments({
    qualifyingTestId: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return scoreQualifyingTest(data);
});
