const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const functions = require('firebase-functions');
const { backupFirestoreWhenBusy } = require('../actions/backup/firestore')(config, firebase, db);

const SCHEDULE = 'every 5 minutes from 06:30 to 22:30';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestoreWhenBusy();
    return result;
  });
