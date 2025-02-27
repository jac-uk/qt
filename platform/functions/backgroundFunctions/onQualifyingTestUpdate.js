import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initOnQualifyingTestUpdate from '../actions/qualifyingTests/onUpdate.js';

const onQualifyingTestUpdate = initOnQualifyingTestUpdate(config, firebase, db);

export default functions.region('europe-west2').firestore
  .document('qualifyingTests/{qualifyingTestId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onQualifyingTestUpdate(context.params.qualifyingTestId, dataBefore, dataAfter);
  });
