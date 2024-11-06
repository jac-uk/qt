'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';

import initBackupFirestore from '../functions/actions/backup/firestore.js';
const { backupFirestore } = initBackupFirestore(config, firebase, db);


const main = async () => {
  return backupFirestore();
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
