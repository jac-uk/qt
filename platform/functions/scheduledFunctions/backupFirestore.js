const config = require('../shared/config');
const { firebase, db } = require('../shared/admin.js');
const functions = require('firebase-functions');
const { backupFirestore } = require('../actions/backup/firestore')(config, firebase, db);

const SCHEDULE = 'every day 23:01';

module.exports = functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestore();
    return result;
  });
