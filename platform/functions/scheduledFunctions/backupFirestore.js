import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import functions from 'firebase-functions';
import { initBackupFirestore } from '../actions/backup/firestore.js';

const { backupFirestore } = initBackupFirestore(config, firebase, db);

const SCHEDULE = 'every day 23:01';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestore();
    return result;
  });
