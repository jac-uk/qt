import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import functions from 'firebase-functions';
import { initBackupFirestoreWhenBusy } from '../actions/backup/firestore.js';

const { backupFirestoreWhenBusy } = initBackupFirestoreWhenBusy(config, firebase, db);

const SCHEDULE = 'every 5 minutes from 06:30 to 22:30';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupFirestoreWhenBusy();
    return result;
  });
