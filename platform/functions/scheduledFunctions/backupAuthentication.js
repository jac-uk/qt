import config from '../shared/config.js';
import functions from 'firebase-functions';
import initBackupAuthentication from '../actions/backup/authentication'
const backupAuthentication = initBackupAuthentication(config);

const SCHEDULE = 'every day 23:00';

export default functions.region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    const result = await backupAuthentication();
    return result;
  });
