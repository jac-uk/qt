'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initUpdateCounts from '../functions/actions/qualifyingTests/updateCounts.js';
const updateCounts = initUpdateCounts(config, firebase, db);

const main = async () => {
  return updateCounts('xDuIoTP5EtiW13WoEWJd');
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
