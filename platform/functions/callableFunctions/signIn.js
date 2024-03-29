const functions = require('firebase-functions');
const config = require('../shared/config');
const { auth, firebase, db } = require('../shared/admin.js');
const { checkArguments } = require('../shared/helpers.js');
const signIn = require('../actions/qualifyingTests/signIn')(config, firebase, db, auth);
// const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  // await checkFunctionEnabled();
  if (!checkArguments({
    email: { required: true },
    testId: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return signIn(data);
});
