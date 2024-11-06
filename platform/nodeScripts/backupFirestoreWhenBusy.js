'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import { initBackupFirestoreWhenBusy } from '../functions/actions/backup/firestore';
const backupFirestoreWhenBusy = initBackupFirestoreWhenBusy(config, firebase, db);

const main = async () => {
  return backupFirestoreWhenBusy();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
