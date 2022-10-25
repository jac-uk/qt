'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { backupFirestoreWhenBusy } = require('../functions/actions/backup/firestore')(config, firebase, db);

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
