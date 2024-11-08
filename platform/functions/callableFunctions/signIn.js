import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import initSignIn from '../actions/qualifyingTests/signIn.js';

const signIn = initSignIn(config, firebase, db, auth);
// import initServiceSettings from '../shared/serviceSettings.js';

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  // await checkFunctionEnabled();
  if (!checkArguments({
    email: { required: true },
    testId: { required: false },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }
  return signIn(data);
});
