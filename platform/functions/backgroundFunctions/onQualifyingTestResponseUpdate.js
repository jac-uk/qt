import functions from 'firebase-functions';
import config from '../shared/config.js';
import initOnQualifyingTestResponseUpdate from '../actions/qualifyingTestResponses/onUpdate.js';

const onQualifyingTestResponseUpdate = initOnQualifyingTestResponseUpdate(config, firebase, db);

export default functions.region('europe-west2').firestore
  .document('qualifyingTestResponses/{qualifyingTestResponseId}')
  .onUpdate((change, context) => {
    const dataBefore = change.before.data();
    const dataAfter = change.after.data();
    return onQualifyingTestResponseUpdate(dataBefore, dataAfter, change.after.ref);
  });
